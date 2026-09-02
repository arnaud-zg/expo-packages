/**
 * Locates the pnpm workspace root by walking up from a starting directory
 * until a pnpm-workspace.yaml is found.
 */
import fs from "fs";
import path from "path";

export function findWorkspaceRoot(startDir: string): string {
  let dir = path.resolve(startDir);

  while (true) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;

    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(
        `Could not find a pnpm-workspace.yaml above ${startDir} — expo-pnpm-catalog must be run inside a pnpm workspace.`,
      );
    }
    dir = parent;
  }
}
