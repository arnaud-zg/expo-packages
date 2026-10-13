import { execSync } from "child_process";

export type RunCommand = (command: string, cwd: string) => void;

const runInherited: RunCommand = (command, cwd) => {
  execSync(command, { cwd, stdio: "inherit" });
};

// A plain install in CI can't change the lockfile, so resolve it alone, then install frozen.
export function installWorkspace(rootDir: string, run: RunCommand = runInherited): void {
  run("pnpm install --lockfile-only", rootDir);
  run("pnpm install --frozen-lockfile", rootDir);
}
