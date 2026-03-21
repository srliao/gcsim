import { Card, CardContent, CardHeader, CardTitle } from "@gcsim/primitives";
import { ExecutorSettings } from "../../components/executor-settings";
import { ActionEditor } from "./action-editor";
import { ConfigEditor } from "./config-editor";
import { RunControls } from "./run-controls";
import { TeamBuilder } from "./team-builder";

export function Simulator() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">Simulator</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Config + Action editors */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <ConfigEditor />
            </CardContent>
          </Card>
          <ActionEditor />
        </div>

        {/* Right column: Team + Settings + Run */}
        <div className="space-y-6">
          <TeamBuilder />
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <ExecutorSettings />
            </CardContent>
          </Card>
          <RunControls />
        </div>
      </div>
    </div>
  );
}
