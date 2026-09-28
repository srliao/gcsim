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
			console.log("aggregator loaded okay");
			postMessage({ type: AggResponse.Ready });
		})
		.catch((e) => {
			console.error(e);
			postMessage({
				type: AggResponse.Failed,
				reason: e instanceof Error ? e.message : "Unknown Error",
			});
		});
}

// @ts-ignore
function initialize(req: { cfg: string }) {
	const resp = JSON.parse(initializeAggregator(req.cfg));
	if (resp.error) {
		return { type: AggResponse.Failed, reason: resp.error };
	}
	return { type: AggResponse.Initialized, result: resp };
}

function add(req: { result: Uint8Array }) {
	const resp = aggregate(req.result);
	if (resp != null) {
		return { type: AggResponse.Failed, reason: JSON.parse(resp).error };
	}
	return { type: AggResponse.Done };
}

// Posts the current stats as a binary model.SignedSimulationStatistics, decoded on the
// main thread. Returns false if the flush failed.
function pushResult(): boolean {
	dirty = false;
	const resp = flushProto();
	if (typeof resp === "string") {
		postMessage({ type: AggResponse.Failed, reason: JSON.parse(resp).error });
		return false;
	}
	postMessage(
		{ type: AggResponse.Result, result: resp, completed: completed },
		// @ts-ignore
		[resp.buffer],
	);
	return true;
}

// Dispatch state for a run. The aggregator hands out iterations directly to the sim
// workers over their ports and pushes results to the main thread on its own timer.
let requested = 0;
let completed = 0;
let target = 0;
let dirty = false;
let flushTimer: ReturnType<typeof setInterval> | undefined;

function dispatch(port: MessagePort) {
	if (requested < target) {
		port.postMessage({ type: "run", itr: requested++ });
	}
}

function start(
	req: { iterations: number; prefetch: number; interval: number },
	ports: readonly MessagePort[],
) {
	requested = 0;
	completed = 0;
	target = req.iterations;
	dirty = false;
	clearInterval(flushTimer);
	flushTimer = setInterval(() => {
		if (dirty) {
			pushResult();
		}
	}, req.interval);

	for (const port of ports) {
		port.onmessage = (ev) => {
			const resp = add(ev.data);
			if (resp.type === AggResponse.Failed) {
				clearInterval(flushTimer);
				postMessage(resp);
				return;
			}
			completed++;
			dirty = true;
			dispatch(port);
			if (completed === target) {
				clearInterval(flushTimer);
				if (pushResult()) {
					postMessage({ type: AggResponse.Finished });
				}
			}
		};
		// keep more than one run queued per worker so a worker never idles waiting on us
		for (let i = 0; i < req.prefetch; i++) {
			dispatch(port);
		}
	}
}

// @ts-ignore
function handleRequest(ev: MessageEvent): any {
	const req = ev.data;
	switch (req.type as AggRequest) {
		case AggRequest.Ready:
			return ready(req);
		case AggRequest.Initialize:
			return postMessage(initialize(req));
		case AggRequest.Start:
			return start(req, ev.ports);
		default:
			console.error("aggregator - unknown request: ", req);
			throw new Error("aggregator unknown request");
	}
}
self.onmessage = (ev) => handleRequest(ev);

// TODO: I hate this
// Web Workers do not currently support modules (in all browsers), so instead all the relevant code in common
// has to be copy/pasted over
// Clean up when supported: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

enum AggRequest {
	Ready = "ready",
	Initialize = "initialize",
	Start = "start",
}

enum AggResponse {
	Failed = "failed",
	Ready = "ready",
	Initialized = "initialized",
	Done = "done",
	Result = "result",
	Finished = "finished",
}
