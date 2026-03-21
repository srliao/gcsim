import { Editor } from "@gcsim/editor";
import { useSimulatorStore } from "../../stores/simulator-store";

export function ConfigEditor() {
  const config = useSimulatorStore((s) => s.config);
  const setConfig = useSimulatorStore((s) => s.setConfig);
  const validationResult = useSimulatorStore((s) => s.validationResult);

  const errors = validationResult?.errors ?? [];

  return (
    <div className="flex flex-col gap-2">
      <Editor value={config} onChange={setConfig} className="min-h-[300px]" />
      {errors.length > 0 && (
        <ul className="flex flex-col gap-1" data-testid="validation-errors">
          {errors.map((error) => (
            <li key={error} className="text-sm text-destructive">
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
