import { describe, expect, it } from "vitest";

import type { RunCommand } from "../workspaceInstall";
import { installWorkspace } from "../workspaceInstall";

const recordingRunner = () => {
  const commands: { command: string; cwd: string }[] = [];
  const run: RunCommand = (command, cwd) => {
    commands.push({ command, cwd });
  };
  return { commands, run };
};

describe("installing the workspace after a sync", () => {
  describe("given sync just wrote new versions into the catalog", () => {
    it("when the workspace installs, then the lockfile may follow even where CI freezes it", () => {
      const { commands, run } = recordingRunner();

      installWorkspace("/repo", run);

      expect(commands).toEqual([{ command: "pnpm install --no-frozen-lockfile", cwd: "/repo" }]);
    });
  });
});
