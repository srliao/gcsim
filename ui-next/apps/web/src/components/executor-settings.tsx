import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gcsim/primitives";
import { useSimulatorStore } from "../stores/simulator-store";

export function ExecutorSettings() {
  const executionMode = useSimulatorStore((s) => s.executionMode);
  const workerCount = useSimulatorStore((s) => s.workerCount);
  const serverUrl = useSimulatorStore((s) => s.serverUrl);
  const setExecutionMode = useSimulatorStore((s) => s.setExecutionMode);
  const setWorkerCount = useSimulatorStore((s) => s.setWorkerCount);
  const setServerUrl = useSimulatorStore((s) => s.setServerUrl);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="execution-mode" className="text-sm font-medium">
          Execution Mode
        </label>
        <Select value={executionMode} onValueChange={setExecutionMode}>
          <SelectTrigger id="execution-mode">
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wasm">WASM</SelectItem>
            <SelectItem value="server">Server</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {executionMode === "wasm" ? (
        <div className="flex flex-col gap-1">
          <label htmlFor="worker-count" className="text-sm font-medium">
            Worker Count: {workerCount}
          </label>
          <input
            id="worker-count"
            type="range"
            min={1}
            max={30}
            value={workerCount}
            onChange={(e) => setWorkerCount(Number(e.target.value))}
            className="w-full"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <label htmlFor="server-url" className="text-sm font-medium">
            Server URL
          </label>
          <Input
            id="server-url"
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://127.0.0.1:8381"
          />
        </div>
      )}
    </div>
  );
}
