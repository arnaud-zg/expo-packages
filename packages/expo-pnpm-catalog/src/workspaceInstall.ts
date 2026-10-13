import { execSync } from "child_process";

export type RunCommand = (command: string, cwd: string) => void;

const runInherited: RunCommand = (command, cwd) => {
  execSync(command, { cwd, stdio: "inherit" });
};

export function installWorkspace(rootDir: string, run: RunCommand = runInherited): void {
  run("pnpm install", rootDir);
}
