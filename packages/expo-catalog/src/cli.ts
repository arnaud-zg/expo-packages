#!/usr/bin/env node
import path from "path";
import chalk from "chalk";
import { Command } from "commander";

import type { CatalogPaths } from "./catalogUtils";
import { runCheck } from "./check";
import { findWorkspaceRoot } from "./findWorkspaceRoot";
import { runSync } from "./sync";

function resolvePaths(appDirOption: string | undefined): CatalogPaths {
  const appDir = path.resolve(appDirOption ?? process.cwd());
  const rootDir = findWorkspaceRoot(appDir);
  return {
    appDir,
    rootDir,
    workspaceYamlPath: path.join(rootDir, "pnpm-workspace.yaml"),
    packageJsonPath: path.join(appDir, "package.json"),
  };
}

const program = new Command()
  .name("expo-catalog")
  .description("Deterministic Expo SDK pnpm-catalog checks and sync");

program
  .command("check")
  .description(
    "Mirror expo-doctor's compatibility check against resolved catalog versions, across the whole workspace",
  )
  .option("--dry-run", "show resolved versions per package without running expo-doctor")
  .option("--app-dir <path>", "path to the Expo app (defaults to the current working directory)")
  .action((opts: { dryRun?: boolean; appDir?: string }) => {
    try {
      const passed = runCheck(resolvePaths(opts.appDir), { dryRun: Boolean(opts.dryRun) });
      if (!passed) process.exitCode = 1;
    } catch (err: unknown) {
      console.error(chalk.red("Unexpected error:"), err);
      process.exitCode = 1;
    }
  });

program
  .command("sync")
  .description(
    "Sync the catalogs in pnpm-workspace.yaml with the Expo SDK using expo install --fix",
  )
  .option("--dry-run", "show what would change without applying it")
  .option("-y, --yes", "skip the confirmation prompt")
  .option("--app-dir <path>", "path to the Expo app (defaults to the current working directory)")
  .action(async (opts: { dryRun?: boolean; yes?: boolean; appDir?: string }) => {
    try {
      await runSync(resolvePaths(opts.appDir), {
        dryRun: Boolean(opts.dryRun),
        yes: Boolean(opts.yes),
      });
    } catch (err: unknown) {
      console.error(chalk.red("Unexpected error:"), err);
      process.exitCode = 1;
    }
  });

void program.parseAsync(process.argv);
