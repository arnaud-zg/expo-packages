import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { WorkspaceCatalogExpoScanner } from "../workspaceCatalogExpoScanner";
import { aPackageJson } from "./builders";

let tmpDir: string;
let skipPath: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "expo-scanner-test-"));
  fs.mkdirSync(path.join(tmpDir, "apps", "expo"), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, "packages", "app"), { recursive: true });
  skipPath = path.join(tmpDir, "apps", "expo", "package.json");
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writePackageJson(directory: string, data: object): void {
  fs.writeFileSync(path.join(tmpDir, directory, "package.json"), JSON.stringify(data));
}

describe("scanning workspace packages for catalog dependencies", () => {
  describe("given a workspace package uses catalog:expo", () => {
    it("when scanned, then the package and its origin are tracked", () => {
      const allVersions = { "expo-camera": "~17.0.10" };
      const pkg = aPackageJson()
        .name("@/app")
        .dependencies({ "expo-camera": "catalog:expo" })
        .build();
      writePackageJson("packages/app", pkg);

      const result = new WorkspaceCatalogExpoScanner(tmpDir).scan(allVersions, skipPath);

      expect(result.versions["expo-camera"]).toBe("~17.0.10");
      expect(result.byPackage["expo-camera"]).toEqual(["@/app"]);
    });
  });

  describe("given a workspace package uses the root catalog", () => {
    it("when scanned, then the package and its origin are tracked", () => {
      const allVersions = { "some-lib": "^3.0.0" };
      const pkg = aPackageJson().name("@/app").dependencies({ "some-lib": "catalog:" }).build();
      writePackageJson("packages/app", pkg);

      const result = new WorkspaceCatalogExpoScanner(tmpDir).scan(allVersions, skipPath);

      expect(result.versions["some-lib"]).toBe("^3.0.0");
      expect(result.byPackage["some-lib"]).toEqual(["@/app"]);
    });
  });

  describe("given multiple workspace packages share the same catalog dependency", () => {
    it("when scanned, then all packages sharing that dep are recorded", () => {
      const allVersions = { "expo-camera": "~17.0.10" };
      fs.mkdirSync(path.join(tmpDir, "packages", "ui"), { recursive: true });

      writePackageJson("packages/app", aPackageJson().name("@/app").build());
      writePackageJson(
        "packages/ui",
        aPackageJson().name("@/ui").dependencies({ "expo-camera": "catalog:expo" }).build(),
      );

      const result = new WorkspaceCatalogExpoScanner(tmpDir).scan(allVersions, skipPath);

      expect(result.byPackage["expo-camera"]).toContain("@/app");
      expect(result.byPackage["expo-camera"]).toContain("@/ui");
    });
  });

  describe("given the expo app itself is in the workspace", () => {
    it("when scanned, then the expo app is excluded to avoid double-counting", () => {
      const allVersions = { "expo-camera": "~17.0.10" };
      writePackageJson(
        "apps/expo",
        aPackageJson().name("@/expo").dependencies({ "expo-camera": "catalog:expo" }).build(),
      );

      const result = new WorkspaceCatalogExpoScanner(tmpDir).scan(allVersions, skipPath);

      expect(result.byPackage["expo-camera"]).toBeUndefined();
    });
  });

  describe("given a package references a dep that is not in any catalog", () => {
    it("when scanned, then the unknown dep is ignored", () => {
      const allVersions = { "expo-camera": "~17.0.10" };
      writePackageJson(
        "packages/app",
        aPackageJson().dependencies({ "some-unknown-pkg": "catalog:expo" }).build(),
      );

      const result = new WorkspaceCatalogExpoScanner(tmpDir).scan(allVersions, skipPath);

      expect(result.versions["some-unknown-pkg"]).toBeUndefined();
    });
  });

  describe("given a workspace directory that does not exist", () => {
    it("when scanned, then it completes safely with no results", () => {
      const scanner = new WorkspaceCatalogExpoScanner(tmpDir);

      expect(() => scanner.scan({ "expo-camera": "~17.0.10" }, skipPath)).not.toThrow();
    });
  });

  describe("given custom workspace directories are provided", () => {
    it("when scanned, then only those directories are searched", () => {
      fs.mkdirSync(path.join(tmpDir, "libs", "shared"), { recursive: true });
      writePackageJson(
        "libs/shared",
        aPackageJson().name("@/shared").dependencies({ "expo-camera": "catalog:expo" }).build(),
      );

      const result = new WorkspaceCatalogExpoScanner(tmpDir, ["libs"]).scan(
        { "expo-camera": "~17.0.10" },
        skipPath,
      );

      expect(result.byPackage["expo-camera"]).toEqual(["@/shared"]);
    });
  });
});
