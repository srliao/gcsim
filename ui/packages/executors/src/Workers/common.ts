/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */

// Go GC target for every wasm instance. The default (100) collects often enough to show up
// in sim time; trading some memory for fewer collections is worth it here.
const GOGC = "400";

const modules = new Map<string, Promise<WebAssembly.Module>>();

// Compiles the wasm binary once per page. The returned module is cloned (not recompiled)
// when posted to each worker.
export function compileWasm(wasm: string): Promise<WebAssembly.Module> {
	let module = modules.get(wasm);
	if (module == null) {
		module = WebAssembly.compileStreaming(fetch(wasm)).catch(() =>
			// compileStreaming requires the application/wasm mime type
			fetch(wasm)
				.then((resp) => resp.arrayBuffer())
				.then((buf) => WebAssembly.compile(buf)),
		);
		module.catch(() => modules.delete(wasm));
		modules.set(wasm, module);
	}
	return module;
}

export namespace Aggregator {
	export enum Request {
		Ready = "ready",
		Initialize = "initialize",
		Start = "start",
	}

	export enum Response {
		Failed = "failed",
		Ready = "ready",
		Initialized = "initialized",
		Done = "done",
		Result = "result",
		Finished = "finished",
	}

	export interface FailedResponse {
		type: Response.Failed;
		reason: string;
	}

	export function FailedResponse(reason: string): FailedResponse {
		return { type: Response.Failed, reason: reason };
	}

	export interface ReadyRequest {
		type: Request.Ready;
		module: WebAssembly.Module;
		gogc: string;
	}

	export function ReadyRequest(module: WebAssembly.Module): ReadyRequest {
		return { type: Request.Ready, module: module, gogc: GOGC };
	}

	export interface ReadyResponse {
		type: Response.Ready;
	}

	export function ReadyResponse(): ReadyResponse {
		return { type: Response.Ready };
	}

	export interface InitializeRequest {
		type: Request.Initialize;
		cfg: string;
	}

	export function InitializeRequest(cfg: string): InitializeRequest {
		return { type: Request.Initialize, cfg: cfg };
	}

	export interface InitializeResponse {
		type: Response.Initialized;
		result: any;
	}

	export function InitializeResponse(result: any): InitializeResponse {
		return { type: Response.Initialized, result: result };
	}

	export interface StartRequest {
		type: Request.Start;
		iterations: number;
		prefetch: number;
		interval: number;
	}

	// ports (one per sim worker) must be passed as transferables alongside this request
	export function StartRequest(
		iterations: number,
		prefetch: number,
		interval: number,
	): StartRequest {
		return {
			type: Request.Start,
			iterations: iterations,
			prefetch: prefetch,
			interval: interval,
		};
	}

	export interface FinishedResponse {
		type: Response.Finished;
	}

	export interface ResultResponse {
		type: Response.Result;
		completed: number;
		// binary model.SignedSimulationStatistics
		result: Uint8Array;
	}
}

export namespace Helper {
	export enum Request {
		Ready = "ready",
		Validate = "validate",
		Sample = "sample",
	}

	export enum Response {
		Failed = "failed",
		Validate = "validated",
		Sample = "sample",
	}

	export interface FailedResponse {
		id: number;
		type: Response.Failed;
		reason: string;
	}

	export function FailedResponse(id: number, reason: string): FailedResponse {
		return { id: id, type: Response.Failed, reason: reason };
	}

	export interface ReadyRequest {
		type: Request.Ready;
		module: WebAssembly.Module;
		gogc: string;
	}

	export function ReadyRequest(module: WebAssembly.Module): ReadyRequest {
		return { type: Request.Ready, module: module, gogc: GOGC };
	}

	export interface ValidateRequest {
		id: number;
		type: Request.Validate;
		cfg: string;
	}

	export function ValidateRequest(id: number, cfg: string): ValidateRequest {
		return { id: id, type: Helper.Request.Validate, cfg: cfg };
	}

	export interface ValidateResponse {
		id: number;
		type: Response.Validate;
		cfg: any;
	}

	export function ValidateResponse(id: number, cfg: any): ValidateResponse {
		return { id: id, type: Response.Validate, cfg: cfg };
	}

	export interface SampleRequest {
		id: number;
		type: Request.Sample;
		cfg: string;
		seed: string;
	}

	export function SampleRequest(
		id: number,
		cfg: string,
		seed: string,
	): SampleRequest {
		return { id: id, type: Helper.Request.Sample, cfg: cfg, seed: seed };
	}

	export interface SampleResponse {
		id: number;
		type: Response.Sample;
		sample: any;
	}
}

export namespace SimWorker {
	export enum Request {
		Ready = "ready",
		Initialize = "initialize",
		Run = "run",
		Connect = "connect",
		Cancel = "cancel",
	}

	export enum Response {
		Failed = "failed",
		Ready = "ready",
		Initialized = "initialized",
		Done = "done",
	}

	export interface FailedResponse {
		type: Response.Failed;
		reason: string;
	}

	export function FailedResponse(reason: string): FailedResponse {
		return { type: Response.Failed, reason: reason };
	}

	export interface ReadyRequest {
		type: Request.Ready;
		module: WebAssembly.Module;
		gogc: string;
	}

	export function ReadyRequest(module: WebAssembly.Module): ReadyRequest {
		return { type: Request.Ready, module: module, gogc: GOGC };
	}

	export interface ReadyResponse {
		type: Response.Ready;
	}

	export function ReadyResponse(): ReadyResponse {
		return { type: Response.Ready };
	}

	export interface InitializeRequest {
		type: Request.Initialize;
		cfg: string;
	}

	export function InitializeRequest(cfg: string): InitializeRequest {
		return { type: Request.Initialize, cfg: cfg };
	}

	export interface InitializeResponse {
		type: Response.Initialized;
	}

	export function InitializeResponse(): InitializeResponse {
		return { type: Response.Initialized };
	}

	export interface RunRequest {
		type: Request.Run;
		itr: number;
	}

	export function RunRequest(itr: number): RunRequest {
		return { type: Request.Run, itr: itr };
	}

	export interface ConnectRequest {
		type: Request.Connect;
	}

	// the aggregator's port must be passed as a transferable alongside this request
	export function ConnectRequest(): ConnectRequest {
		return { type: Request.Connect };
	}

	export interface CancelRequest {
		type: Request.Cancel;
	}

	export function CancelRequest(): CancelRequest {
		return { type: Request.Cancel };
	}

	export interface RunResponse {
		type: Response.Done;
		result: Uint8Array;
		itr: number;
	}

	export function RunResponse(result: Uint8Array, itr: number): RunResponse {
		return { type: Response.Done, result: result, itr: itr };
	}
}
