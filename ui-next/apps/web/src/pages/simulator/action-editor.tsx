import { Editor } from "@gcsim/editor";
import { Button } from "@gcsim/primitives";
import { useState } from "react";
import { useSimulatorStore } from "../../stores/simulator-store";

export function ActionEditor() {
  const config = useSimulatorStore((s) => s.config);
  const setConfig = useSimulatorStore((s) => s.setConfig);
  const [readOnly, setReadOnly] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Action List</h3>
        <Button variant="ghost" size="sm" onClick={() => setReadOnly(!readOnly)}>
          {readOnly ? "Edit" : "Read Only"}
        </Button>
      </div>
      <Editor value={config} onChange={setConfig} readOnly={readOnly} className="min-h-[200px]" />
    </div>
  );
}
