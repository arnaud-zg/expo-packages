/**
 * Represents the Expo app's package.json — provides resolved copies for tools
 * that cannot understand catalog: references (expo-doctor, expo install --fix),
 * and always restores the original file.
 */
import fs from "fs";

import type { PackageJson } from "./catalogUtils";
import { isCatalogRef } from "./catalogUtils";

export type { PackageJson };

export class ExpoAppManifest {
  private constructor(
    private readonly filePath: string,
    private readonly original: string,
    readonly data: PackageJson,
  ) {}

  static load(filePath: string): ExpoAppManifest {
    const original = fs.readFileSync(filePath, "utf-8");
    return new ExpoAppManifest(filePath, original, JSON.parse(original) as PackageJson);
  }

  withDeps(
    dependencies: Record<string, string>,
    devDependencies: Record<string, string>,
  ): ExpoAppManifest {
    const updated: PackageJson = { ...this.data, dependencies, devDependencies };
    return new ExpoAppManifest(this.filePath, this.original, updated);
  }

  write(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2) + "\n");
  }

  restore(): void {
    fs.writeFileSync(this.filePath, this.original);
  }

  readFixed(): PackageJson {
    return JSON.parse(fs.readFileSync(this.filePath, "utf-8")) as PackageJson;
  }

  excludedPackages(): Set<string> {
    return new Set(this.data.expo?.install?.exclude ?? []);
  }

  catalogPackages(): Set<string> {
    const allDeps = { ...this.data.dependencies, ...this.data.devDependencies };
    return new Set(
      Object.entries(allDeps)
        .filter(([, version]) => isCatalogRef(version))
        .map(([name]) => name),
    );
  }
}
