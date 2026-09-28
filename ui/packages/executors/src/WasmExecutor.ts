import { model, type ParsedResult, type Sample } from "@gcsim/types";
import type { Executor } from "./Executor";
import { Aggregator, compileWasm, Helper, SimWorker } from "./Workers/common";

const VIEWER_THROTTLE = 100;
// Run requests kept queued per sim worker, so a worker never idles waiting on the aggregator.
const PREFETCH = 2;

export class WasmExecutor implements Executor {
	private wasmPath: string;
	private helper: HelperExecutor;
	private aggregator: Worker | null;
	private workers: Worker[];
	private workerCount: number;
	private isRunning: boolean;
	private runStarted: number;

	constructor(wasm: string) {
		this.wasmPath = wasm;
		this.helper = new HelperExecutor(wasm);

		this.aggregator = null;
		this.workers = [];
		this.workerCount = 3;
		this.isRunning = false;
		this.runStarted = 0;
	}

	public ready(): Promise<boolean> {
		return new Promise((resolve) => resolve(!this.isRunning));
	}

	public running(): boolean {
		return this.isRunning;
	}

	public setWorkerCount(count: number) {
		this.workerCount = count;
	}

	private createAggregator(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			if (this.aggregator) {
				resolve(true);
				return;
			}

			this.aggregator = new Worker(
				new URL("./Workers/aggregator.ts", import.meta.url),
			);
			const aggregator = this.aggregator;
			compileWasm(this.wasmPath).then(
				(module) => aggregator.postMessage(Aggregator.ReadyRequest(module)),
				reject,
			);
			this.aggregator.onmessage = (ev) => {
				switch (ev.data.type as Aggregator.Response) {
					case Aggregator.Response.Ready:
						resolve(true);
						return;
					case Aggregator.Response.Failed:
						reject((ev.data as Aggregator.FailedResponse).reason);
						return;
				}
			};
		});
	}

	private createWorkers(): Promise<boolean> {
		console.log("loading workers", this.workerCount, this);
		const diff = this.workerCount - this.workers.length;

		if (diff < 0) {
			this.workers.splice(diff).forEach((w) => {
				w.terminate();
			});
			return Promise.resolve(true);
		}

		console.log("loading " + diff + " workers");
		const promises: Promise<boolean>[] = [];
		for (let i = 0; i < diff; i++) {
			promises.push(
				new Promise<boolean>((resolve, reject) => {
					const worker = new Worker(
						new URL("./Workers/worker.ts", import.meta.url),
					);
					compileWasm(this.wasmPath).then(
						(module) => worker.postMessage(SimWorker.ReadyRequest(module)),
						reject,
					);

					const idx = this.workers.push(worker) - 1;
					worker.onmessage = (ev) => {
						switch (ev.data.type as SimWorker.Response) {
							case SimWorker.Response.Ready:
								resolve(true);
								return;
							case SimWorker.Response.Failed:
								reject(
									"Worker " +
										idx +
										" " +
										(ev.data as SimWorker.FailedResponse).reason,
								);
								return;
						}
					};
				}),
			);
		}
		return Promise.all(promises).then(() => true);
	}

	public run(
		cfg: string,
		updateResult: (result: model.SimulationResult, hash: string) => void,
	): Promise<boolean | void> {
		this.isRunning = true;
		this.runStarted = performance.now();

		// 1. Create Aggregator & Workers
		const created = Promise.all([
			this.createAggregator(),
			this.createWorkers(),
		]);

		let result: model.SimulationResult | null = null;
		let maxIterations = 0;

		// 2. Initialize Aggregator & Workers
		const initialized = created.then(() => {
			const promises: Promise<boolean>[] = [];

			// initialize aggregator
			promises.push(
				new Promise<boolean>((resolve, reject) => {
					if (this.aggregator == null) {
						reject("Aggregator is null!");
						return;
					}

					this.aggregator.onmessage = (ev) => {
						switch (ev.data.type as Aggregator.Response) {
							case Aggregator.Response.Initialized:
								result = (ev.data as Aggregator.InitializeResponse).result;
								maxIterations = result?.simulator_settings?.iterations ?? 1000;
								resolve(true);
								return;
							case Aggregator.Response.Failed:
								reject((ev.data as Aggregator.FailedResponse).reason);
								return;
						}
					};
					this.aggregator.postMessage(Aggregator.InitializeRequest(cfg));
				}),
			);

			// initialize workers
			this.workers.forEach((worker) => {
				promises.push(
					new Promise<boolean>((resolve, reject) => {
						worker.onmessage = (ev) => {
							switch (ev.data.type as SimWorker.Response) {
								case SimWorker.Response.Initialized:
									resolve(true);
									return;
								case SimWorker.Response.Failed:
									reject((ev.data as SimWorker.FailedResponse).reason);
									return;
							}
						};
						worker.postMessage(SimWorker.InitializeRequest(cfg));
					}),
				);
			});

			return Promise.all(promises);
		});

		// 3. start execution
		return initialized.then(() => {
			return new Promise((resolve, reject) => {
				if (this.aggregator == null) {
					reject("Aggregator is null!");
					return;
				}
				this.aggregator.onmessage = (ev) => {
					switch (ev.data.type as Aggregator.Response) {
						case Aggregator.Response.Result: {
							const { hash, stats } = model.SignedSimulationStatistics.decode(
								(ev.data as Aggregator.ResultResponse).result,
							);

							const out = Object.assign({}, result);
							out.statistics = stats;
							updateResult(out, hash ?? "");
							return;
						}
						case Aggregator.Response.Finished:
							this.isRunning = false;
							resolve(true);
							if (this.runStarted > 0) {
								const end = performance.now();
								console.log(`run time: ${end - this.runStarted} ms`);
								this.runStarted = 0;
							}
							return;
						case Aggregator.Response.Failed:
							if (this.isRunning) {
								this.isRunning = false;
								reject((ev.data as Aggregator.FailedResponse).reason);
							}
					}
				};

				// Wire each sim worker directly to the aggregator. The aggregator hands out
				// iterations over these ports, so the main thread is only involved in setup,
				// periodic results and completion.
				const aggPorts: MessagePort[] = [];
				this.workers.forEach((worker) => {
					const { port1, port2 } = new MessageChannel();
					worker.onmessage = (ev) => {
						if (ev.data.type === SimWorker.Response.Failed) {
							this.isRunning = false;
							reject((ev.data as SimWorker.FailedResponse).reason);
						}
					};
					worker.postMessage(SimWorker.ConnectRequest(), [port1]);
					aggPorts.push(port2);
				});
				this.aggregator.postMessage(
					Aggregator.StartRequest(maxIterations, PREFETCH, VIEWER_THROTTLE),
					aggPorts,
				);
			});
		});
	}

	public cancel(): void {
		if (!this.isRunning || this.aggregator == null) {
			return;
		}

		this.isRunning = false;
		console.log("execution canceled");
		this.workers.forEach((worker) => {
			worker.onmessage = null;
			worker.postMessage(SimWorker.CancelRequest());
		});

		// It is possible that there are N results in the aggregator queue that we have no control
		// over. Even if we set the onmessage here to null, the aggregator will still process through
		// all N results. Since there is no way to clear the worker queue, recreating the worker is the
		// next best thing.
		//
		// Downside of this approach is any memory allocation/optimizations from previous runs will not
		// carry over, making executions after a cancel "less optimal".
		this.aggregator.terminate();
		this.aggregator = null;

		if (this.runStarted > 0) {
			const end = performance.now();
			console.log(`cancelled with run time: ${end - this.runStarted} ms`);
			this.runStarted = 0;
		}
	}

	public validate(cfg: string): Promise<ParsedResult> {
		return this.helper.validate(cfg);
	}

	public sample(cfg: string, seed: string): Promise<Sample> {
		return this.helper.sample(cfg, seed);
	}

	public buildInfo(): { hash: string; date: string } {
		return this.helper.buildInfo();
	}
}

class HelperExecutor {
	private wasmPath: string;
	private helper: Worker | undefined;
	private responses = new Map<number, MessageEvent>();
	private id = 0;

	constructor(wasm: string) {
		this.wasmPath = wasm;
	}

	private initialize() {
		if (this.helper != null) {
			return;
		}

		this.helper = new Worker(new URL("./Workers/helper.ts", import.meta.url));
		const helper = this.helper;
		compileWasm(this.wasmPath).then(
			(module) => helper.postMessage(Helper.ReadyRequest(module)),
			(e) => console.error("failed to compile wasm", e),
		);
		this.helper.onmessage = (ev) => {
			this.responses.set(ev.data.id, ev);
		};
	}

	private requestId() {
		return this.id++;
	}

	private waitForResponse(id: number, cb: (event: MessageEvent) => void) {
		const event = this.responses.get(id);
		if (event != null) {
			cb(event);
			this.responses.delete(id);
			return;
		}
		setTimeout(() => this.waitForResponse(id, cb), 100);
	}

	public validate(cfg: string): Promise<ParsedResult> {
		this.initialize();

		const id = this.requestId();
		return new Promise((resolve, reject) => {
			function handleResponse(event: MessageEvent) {
				switch (event.data.type as Helper.Response) {
					case Helper.Response.Validate:
						resolve((event.data as Helper.ValidateResponse).cfg);
						return;
					case Helper.Response.Failed:
						reject((event.data as Helper.FailedResponse).reason);
						return;
					default:
						reject("unknown validate response: " + event.data.type);
				}
			}
			this.waitForResponse(id, handleResponse);
			this.helper?.postMessage(Helper.ValidateRequest(id, cfg));
		});
	}

	public sample(cfg: string, seed: string): Promise<Sample> {
		this.initialize();
		const id = this.requestId();

		return new Promise((resolve, reject) => {
			function handleResponse(event: MessageEvent) {
				switch (event.data.type as Helper.Response) {
					case Helper.Response.Sample:
						resolve((event.data as Helper.SampleResponse).sample);
						return;
					case Helper.Response.Failed:
						reject((event.data as Helper.FailedResponse).reason);
						return;
					default:
						console.log(event.data);
						reject("unknown sample response: " + event.data.type);
				}
			}
			this.waitForResponse(id, handleResponse);
			this.helper?.postMessage(Helper.SampleRequest(id, cfg, seed));
		});
	}

	public buildInfo(): { hash: string; date: string } {
		throw new Error("Method not implemented.");
	}
}
