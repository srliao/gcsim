import { LogDetails, ParsedResult, SimResults } from "@gcsim/types";
import { throttle } from "lodash-es";
import { Executor } from "./Executor";
import { Aggregator, Helper, SimWorker } from "./Workers/common";

const VIEWER_THROTTLE = 100;

export class WasmExecutor implements Executor {
  private aggregator: Worker;
  private aggregatorReady: boolean;
  private workers: Worker[];
  private workersReady: boolean[];
  private isRunning: boolean;

  private helper: Worker;

  constructor() {
    this.aggregatorReady = false;
    this.aggregator = this.createAggregator();
    this.workers = [];
    this.workersReady = [];
    this.isRunning = false;

    // TODO: make a new helper worker script with only stateless functions
    this.helper = new Worker(new URL("./Workers/helper.ts", import.meta.url));
  }

  private createAggregator(): Worker {
    this.aggregatorReady = false;
    const out = new Worker(new URL("./Workers/aggregator.ts", import.meta.url));
    out.onmessage = (ev) => {
      switch (ev.data.type as Aggregator.Response) {
        case Aggregator.Response.Ready:
          this.aggregatorReady = true;
          break;
      }
    };
    return out;
  }

  private loaded(): Worker[] {
    return this.workers.filter((_, i) => this.workersReady[i]);
  }

  public count(): number {
    return this.loaded().length;
  }

  public ready(): boolean {
    return this.aggregatorReady && this.count() > 0 && !this.isRunning;
  }

  public running(): boolean {
    return this.isRunning;
  }

  public setWorkerCount(count: number) {
    console.log("loading workers", count, this);
    const diff = count - this.workers.length;

    if (diff < 0) {
      this.workersReady.splice(diff);
      this.workers.splice(diff).forEach((w) => w.terminate());
      return;
    }

    console.log("loading " + diff + " workers");
    for (let i = 0; i < diff; i++) {
      this.createWorker().then((w) => {
        console.log("worker " + w + " is now ready");
      });
    }
  }

  private createWorker(): Promise<number> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL("./Workers/worker.ts", import.meta.url)
      );
      const idx = this.workers.push(worker) - 1;
      this.workersReady.push(false);
      worker.onmessage = (ev) => {
        switch (ev.data.type as SimWorker.Response) {
          case SimWorker.Response.Ready:
            this.workersReady[idx] = true;
            resolve(idx);
            return;
          case SimWorker.Response.Failed:
            reject(
              "Worker " +
                idx +
                " " +
                (ev.data as SimWorker.FailedResponse).reason
            );
            return;
          default:
            reject("Worker " + idx + " - unknown response: " + ev.data);
        }
      };
    });
  }

  public validate(cfg: string): Promise<ParsedResult> {
    return new Promise((resolve, reject) => {
      this.helper.onmessage = (ev) => {
        switch (ev.data.type as Helper.Response) {
          case Helper.Response.Validate:
            resolve((ev.data as Helper.ValidateResponse).cfg);
            return;
          case Helper.Response.Failed:
            reject((ev.data as Helper.FailedResponse).reason);
            return;
          default:
            reject("unknown validate response: " + ev.data);
        }
      };
      this.helper.postMessage(Helper.ValidateRequest(cfg));
    });
  }

  public debug(cfg: string, seed: string): Promise<LogDetails[]> {
    return new Promise((resolve, reject) => {
      this.helper.onmessage = (ev) => {
        switch (ev.data.type as Helper.Response) {
          case Helper.Response.GenerateDebug:
            resolve((ev.data as Helper.GenerateDebugResponse).debug);
            return;
          case Helper.Response.Failed:
            reject((ev.data as Helper.FailedResponse).reason);
            return;
          default:
            reject("unknown generate debug response: " + ev.data);
        }
      };
      this.helper.postMessage(Helper.GenerateDebugRequest(cfg, seed));
    });
  }

  public run(
    cfg: string,
    setResult: (result: SimResults) => void
  ): Promise<boolean | void> {
    if (!this.ready()) {
      return Promise.reject("aggregators and/or workers are not ready!");
    }

    const startTime = Date.now() * 1_000_000;
    let result: SimResults | null = null;
    let maxIterations = 0;

    const initPromises: Promise<boolean>[] = [];
    // 1. initialize aggregator
    initPromises.push(
      new Promise<boolean>((resolve, reject) => {
        this.aggregator.onmessage = (ev) => {
          switch (ev.data.type as Aggregator.Response) {
            case Aggregator.Response.Initialized:
              result = (ev.data as Aggregator.InitializeResponse).result;
              maxIterations = result?.max_iterations ?? 1000;
              resolve(true);
              return;
            case Aggregator.Response.Failed:
              reject((ev.data as Aggregator.FailedResponse).reason);
              return;
          }
        };
        this.aggregator.postMessage(Aggregator.InitializeRequest(cfg));
      })
    );

    // 2. initialize all workers
    this.loaded().forEach((worker) => {
      initPromises.push(
        new Promise<boolean>((resolve, reject) => {
          worker.onmessage = (ev) => {
            switch (ev.data.type as SimWorker.Response) {
              case SimWorker.Response.Initialized:
                resolve(true);
                return;
              case SimWorker.Response.Failed:
                reject((ev.data as Aggregator.FailedResponse).reason);
                return;
            }
          };
          worker.postMessage(SimWorker.InitializeRequest(cfg));
        })
      );
    });

    // 3. after all initializes complete, start execution
    return Promise.all(initPromises).then(() => {
      const throttledFlush = throttle(
        () => {
          if (this.isRunning) {
            this.aggregator.postMessage(Aggregator.FlushRequest(startTime));
          }
        },
        VIEWER_THROTTLE,
        { leading: true, trailing: true }
      );

      let completed = 0;
      let requested = 0;
      this.isRunning = true;
      this.aggregator.onmessage = (ev) => {
        switch (ev.data.type as Aggregator.Response) {
          case Aggregator.Response.Result:
            const out = Object.assign({}, result);
            out.statistics = (ev.data as Aggregator.ResultResponse).result;
            setResult(out);
            if (completed >= maxIterations) {
              this.isRunning = false;
              Promise.resolve(true);
            }
            return;
          case Aggregator.Response.Done:
            completed += 1;
            throttledFlush();
            return;
          case Aggregator.Response.Failed:
            // TODO: bug with throttled flush where a flush may happen after a cancel request.
            //    When this happens, the existing aggregator has no data and fails to flush.
            //    this doesnt cause any problems (yet) and just produces an error in console.
            if (this.isRunning) {
              throw (ev.data as Aggregator.FailedResponse).reason;
            }
        }
      };

      this.loaded().forEach((worker) => {
        worker.onmessage = (ev) => {
          switch (ev.data.type as SimWorker.Response) {
            case SimWorker.Response.Done:
              const resp: SimWorker.RunResponse = ev.data;
              this.aggregator.postMessage(Aggregator.AddRequest(resp.result));
              if (requested < maxIterations) {
                worker.postMessage(SimWorker.RunRequest(requested++));
              }
              return;
            case SimWorker.Response.Failed:
              throw (ev.data as Aggregator.FailedResponse).reason;
          }
        };

        if (requested < maxIterations) {
          worker.postMessage(SimWorker.RunRequest(requested++));
        }
      });
    });
  }

  public cancel(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    console.log("execution canceled");
    this.workers.forEach((worker) => {
      worker.onmessage = null;
    });

    // It is possible that there are N AddRequests in the aggregator queue that we have no control
    // over. Even if we set the onmessage here to null, the aggregator will still process through
    // all N requests. Since there is no way to clear the worker queue, recreating the worker is the
    // next best thing.
    //
    // Downside of this approach is any memory allocation/optimizations from previous runs will not
    // carry over, making executions after a cancel "less optimal".
    this.aggregator.terminate();
    this.aggregator = this.createAggregator();
  }

  buildInfo(): { hash: string; date: string } {
    throw new Error("Method not implemented.");
  }
}