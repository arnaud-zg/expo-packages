/**
 * Builder that constructs a fully resolved ExpoAppManifest by applying
 * catalog version resolution and merging extra workspace dependencies.
 *
 * Usage:
 *   const resolved = ExpoManifestResolver
 *     .from(manifest)
 *     .withCatalogResolution(workspace)
 *     .mergeExtraPackages(extra.versions)
 *     .build();
 */
import type { CatalogWorkspace } from "./catalogWorkspace";
import type { ExpoAppManifest } from "./expoAppManifest";

export class ExpoManifestResolver {
  private constructor(
    private readonly manifest: ExpoAppManifest,
    private readonly deps: Record<string, string>,
    private readonly devDeps: Record<string, string>,
  ) {}

  static from(manifest: ExpoAppManifest): ExpoManifestResolver {
    return new ExpoManifestResolver(
      manifest,
      { ...manifest.data.dependencies },
      { ...manifest.data.devDependencies },
    );
  }

  withCatalogResolution(workspace: CatalogWorkspace): ExpoManifestResolver {
    return new ExpoManifestResolver(
      this.manifest,
      workspace.resolveDeps(this.deps),
      workspace.resolveDeps(this.devDeps),
    );
  }

  mergeExtraPackages(extraVersions: Record<string, string>): ExpoManifestResolver {
    const merged = { ...this.deps };
    for (const [name, version] of Object.entries(extraVersions)) {
      merged[name] ??= version;
    }
    return new ExpoManifestResolver(this.manifest, merged, this.devDeps);
  }

  build(): ExpoAppManifest {
    return this.manifest.withDeps(this.deps, this.devDeps);
  }
}
