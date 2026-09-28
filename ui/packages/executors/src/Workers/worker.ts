/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-ignore
self.importScripts("/wasm_exec.js");

// The module is compiled once on the main thread and shared by every worker.
// @ts-ignore
function ready(req: { module: WebAssembly.Module; gogc: string }) {
	const go = new Go();
	go.env = { ...go.env, GOGC: req.gogc };
	WebAssembly.instantiate(req.module, go.importObject)
		.then((instance) => {
			go.run(instance);
			postMessage({ type: WorkerResponse.Ready });
		})
		.catch((e) => {
			console.error(e);
			postMessage({
				type: WorkerResponse.Failed,
				reason: e instanceof Error ? e.message : "Unknown Error",
			});
		});
}

// @ts-ignore
function initialize(req: { cfg: string }) {
	const resp = initializeWorker(req.cfg);
	if (resp != null) {
		return { type: WorkerResponse.Failed, reason: JSON.parse(resp).error };
	}
	return { type: WorkerResponse.Initialized };
}

// Port to the aggregator. Run requests arrive on it and results go back on it,
// so per-iteration traffic never touches the main thread.
let aggPort: MessagePort | null = null;

function connect(port: MessagePort) {
	aggPort?.close();
	aggPort = port;
	aggPort.onmessage = (ev) => {
		if (ev.data.type !== WorkerRequest.Run) {
			return;
		}
		const resp = run(ev.data);
		if (resp.type === WorkerResponse.Done) {
			const result = resp.result as Uint8Array;
			aggPort?.postMessage(resp, [result.buffer]);
			return;
		}
		postMessage(resp);
	};
}

function cancel() {
	aggPort?.close();
	aggPort = null;
}

function run(req: { itr: number }) {
	try {
		const resp = simulate();
		if (typeof resp === "string" || resp instanceof String) {
			return {
				type: WorkerResponse.Failed,
				reason: JSON.parse(resp as string).error,
			};
		}
		return { type: WorkerResponse.Done, result: resp, itr: req.itr };
	} catch (e) {
		console.log("simulate() call failed");
		return { type: WorkerResponse.Failed, reason: `Failed with error: ${e}` };
	}
}

// @ts-ignore
function handleRequest(ev: MessageEvent) {
	const req = ev.data;
	switch (req.type as WorkerRequest) {
		case WorkerRequest.Ready:
			return ready(req);
		case WorkerRequest.Initialize:
			return postMessage(initialize(req));
		case WorkerRequest.Connect:
			return connect(ev.ports[0]);
		case WorkerRequest.Cancel:
			return cancel();
		default:
			console.error("aggregator - unknown request: ", req);
			throw new Error("aggregator unknown request");
	}
}
self.onmessage = (ev) => handleRequest(ev);

// TODO: I hate this
// Web Workers do not currently support modules (in all browsers), so instead the relevant code in common
// has to be copy/pasted over
// Clean up when supported: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

enum WorkerRequest {
	Ready = "ready",
	Initialize = "initialize",
	Run = "run",
	Connect = "connect",
	Cancel = "cancel",
}

enum WorkerResponse {
	Failed = "failed",
	Ready = "ready",
	Initialized = "initialized",
	Done = "done",
}
