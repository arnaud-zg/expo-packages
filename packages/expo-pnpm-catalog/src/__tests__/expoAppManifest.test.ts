import fs from "fs";
import os from "os";
import path from "path";
import { Builder } from "builder-pattern";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { PackageJson } from "../catalogUtils";
import { ExpoAppManifest } from "../expoAppManifest";
import { aPackageJson } from "./builders";

let tmpDir: string;
let filePath: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "expo-manifest-test-"));
  filePath = path.join(tmpDir, "package.json");
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeManifest(data: PackageJson): string {
  const content = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(filePath, content);
  return content;
}

describe("reading the expo app package.json", () => {
  describe("given the expo app declares catalog dependencies", () => {
    it("when loaded, then only catalog-referenced packages are tracked for sync", () => {
      const data = aPackageJson()
        .dependencies({ "expo-camera": "catalog:expo", "some-lib": "catalog:", expo: "~53.0.0" })
        .build();
      writeManifest(data);

      const manifest = ExpoAppManifest.load(filePath);

      expect(manifest.catalogPackages()).toEqual(new Set(["expo-camera", "some-lib"]));
    });

    it("when a catalog dep is in devDependencies, then it is also tracked for sync", () => {
      const data = aPackageJson()
        .dependencies({})
        .devDependencies({ "expo-build-properties": "catalog:expo" })
        .build();
      writeManifest(data);

      const manifest = ExpoAppManifest.load(filePath);

      expect(manifest.catalogPackages()).toContain("expo-build-properties");
    });

    it("when a dep uses the root catalog, then it is also tracked for sync", () => {
      const data = aPackageJson()
        .dependencies({})
        .devDependencies({ "some-lib": "catalog:" })
        .build();
      writeManifest(data);

      const manifest = ExpoAppManifest.load(filePath);

      expect(manifest.catalogPackages()).toContain("some-lib");
    });
  });

  describe("given some packages are excluded from expo install", () => {
    it("when loaded, then excluded packages are not synced", () => {
      const data = Builder<PackageJson>({
        expo: { install: { exclude: ["react", "react-native"] } },
      }).build();
      writeManifest(data);

      const manifest = ExpoAppManifest.load(filePath);

      expect(manifest.excludedPackages()).toEqual(new Set(["react", "react-native"]));
    });
  });

  describe("given the expo app manifest is loaded", () => {
    it("when written with resolved versions, then expo tooling sees concrete versions", () => {
      writeManifest(aPackageJson().build());

      ExpoAppManifest.load(filePath).withDeps({ "expo-camera": "~17.0.10" }, {}).write();

      const written = JSON.parse(fs.readFileSync(filePath, "utf-8")) as PackageJson;
      expect(written.dependencies?.["expo-camera"]).toBe("~17.0.10");
    });

    it("when restored after being written, then the original catalog references are back", () => {
      const original = writeManifest(aPackageJson().build());

      const resolved = ExpoAppManifest.load(filePath).withDeps({ "expo-camera": "~17.0.10" }, {});
      resolved.write();
      resolved.restore();

      expect(fs.readFileSync(filePath, "utf-8")).toBe(original);
    });

    it("when expo tooling updates the file externally, then the new versions can be read back", () => {
      writeManifest(aPackageJson().build());
      const manifest = ExpoAppManifest.load(filePath);

      const externallyUpdated: PackageJson = {
        ...manifest.data,
        dependencies: { "expo-camera": "~17.0.10" },
      };
      fs.writeFileSync(filePath, JSON.stringify(externallyUpdated, null, 2) + "\n");

      const fixed = manifest.readFixed();
      expect(fixed.dependencies?.["expo-camera"]).toBe("~17.0.10");
    });
  });
});
