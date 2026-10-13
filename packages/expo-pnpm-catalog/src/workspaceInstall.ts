import { execSync } from "child_process";

export type RunCommand = (command: string, cwd: string) => void;

const runInherited: RunCommand = (command, cwd) => {
  execSync(command, { cwd, stdio: "inherit" });
};

// Sync changes the catalog on purpose, so the lockfile has to follow even where CI freezes it.
export function installWorkspace(rootDir: string, run: RunCommand = runInherited): void {
  run("pnpm install --no-frozen-lockfile", rootDir);
}
