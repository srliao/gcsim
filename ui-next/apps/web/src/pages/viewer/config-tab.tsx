import { Editor } from "@gcsim/editor";
import { Button } from "@gcsim/primitives";
import type { Sim } from "@gcsim/types";
import { useState } from "react";

interface ConfigTabProps {
  results: Sim.SimResults;
}

export function ConfigTab({ results }: ConfigTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedConfig, setEditedConfig] = useState(results.config_file ?? "");

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleRerun = () => {
    console.log("Re-run with config:", editedConfig);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant={isEditing ? "secondary" : "outline"} onClick={handleToggleEdit}>
          {isEditing ? "Cancel" : "Edit"}
        </Button>
        {isEditing && <Button onClick={handleRerun}>Re-run</Button>}
      </div>
      <Editor
        value={editedConfig}
        onChange={isEditing ? setEditedConfig : undefined}
        readOnly={!isEditing}
        className="min-h-[400px]"
      />
    </div>
  );
}
