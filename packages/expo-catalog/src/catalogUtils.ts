/**
 * Shared types, constants, and pure functions used across expo-catalog.
 */
import chalk from "chalk";

export const SEPARATOR = chalk.dim("─".repeat(60));

/** Fallback top-level workspace directories when pnpm-workspace.yaml declares none. */
export const DEFAULT_WORKSPACE_DIRS = ["apps", "packages", "tooling"] as const;

/** Filesystem locations resolved for a single check/sync run. */
export type CatalogPaths = {
  /** Root of the pnpm workspace (directory containing pnpm-workspace.yaml). */
  rootDir: string;
  /** Directory of the Expo app being checked/synced. */
  appDir: string;
  /** Absolute path to pnpm-workspace.yaml. */
  workspaceYamlPath: string;
  /** Absolute path to the Expo app's package.json. */
  packageJsonPath: string;
};

export type WorkspaceYaml = {
  packages?: string[];
  catalog?: Record<string, string>;
  catalogs?: Record<string, Record<string, string>>;
};

export type PackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  expo?: {
    install?: {
      exclude?: string[];
    };
  };
  [key: string]: unknown;
};

export type ExtraPackages = {
  /** Which workspace packages declare each catalog package */
  byPackage: Record<string, string[]>;
  /** Resolved version from the catalogs for each package */
  versions: Record<string, string>;
};

// ── isCatalogRef ─────────────────────────────────────────────────────────────

/**
 * Returns true for any pnpm catalog reference (`catalog:`, `catalog:expo`, etc.)
 */
export function isCatalogRef(version: string): boolean {
  return version.startsWith("catalog:");
}

// ── getAllCatalogVersions ─────────────────────────────────────────────────────

/**
 * Flattens all catalog sections (root `catalog:` and every named `catalogs.*`)
 * into a single package→version map.  Named catalogs are merged first; the
 * root catalog wins on collision so that explicit overrides are respected.
 */
export function getAllCatalogVersions(workspace: WorkspaceYaml): Record<string, string> {
  const result: Record<string, string> = {};
  for (const catalog of Object.values(workspace.catalogs ?? {})) {
    Object.assign(result, catalog);
  }
  Object.assign(result, workspace.catalog ?? {});
  return result;
}

// ── resolveCatalogRefs ───────────────────────────────────────────────────────

function resolveVersion(name: string, version: string, workspace: WorkspaceYaml): string {
  if (version === "catalog:") return workspace.catalog?.[name] ?? version;
  if (version.startsWith("catalog:")) {
    const catalogName = version.slice("catalog:".length);
    return workspace.catalogs?.[catalogName]?.[name] ?? version;
  }
  return version;
}

/**
 * Resolves all `catalog:*` version references in a deps map to their
 * concrete versions from pnpm-workspace.yaml.
 */
export function resolveCatalogRefs(
  deps: Record<string, string>,
  workspace: WorkspaceYaml,
): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [name, version] of Object.entries(deps)) {
    resolved[name] = resolveVersion(name, version, workspace);
  }
  return resolved;
}

// ── updateVersionInYaml ──────────────────────────────────────────────────────

/**
 * Updates a single package version in pnpm-workspace.yaml content in place,
 * preserving all comments and formatting.
 */
export function updateVersionInYaml(
  content: string,
  packageName: string,
  newVersion: string,
): string {
  const escapedName = packageName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^([ \\t]+(?:"${escapedName}"|${escapedName}):\\s*)(.+)$`);

  return content
    .split("\n")
    .map((line) => {
      const match = line.match(pattern);
      return match ? `${match[1]}"${newVersion}"` : line;
    })
    .join("\n");
}
