import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { findWorkspaceRoot } from "../findWorkspaceRoot";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "expo-catalog-root-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("locating the pnpm workspace root", () => {
  describe("given a pnpm-workspace.yaml exists at the start directory", () => {
    it("when searched, then that directory is returned", () => {
      fs.writeFileSync(path.join(tmpDir, "pnpm-workspace.yaml"), "packages: []");

      expect(findWorkspaceRoot(tmpDir)).toBe(tmpDir);
    });
  });

  describe("given pnpm-workspace.yaml lives in a parent directory", () => {
    it("when searched from a nested app directory, then the parent is returned", () => {
      fs.writeFileSync(path.join(tmpDir, "pnpm-workspace.yaml"), "packages: []");
      const appDir = path.join(tmpDir, "apps", "expo");
      fs.mkdirSync(appDir, { recursive: true });

      expect(findWorkspaceRoot(appDir)).toBe(tmpDir);
    });
  });

  describe("given no pnpm-workspace.yaml exists anywhere above the start directory", () => {
    it("when searched, then it throws", () => {
      const isolatedDir = fs.mkdtempSync(path.join(os.tmpdir(), "expo-catalog-no-workspace-"));

      expect(() => findWorkspaceRoot(isolatedDir)).toThrow(/pnpm-workspace\.yaml/);

      fs.rmSync(isolatedDir, { recursive: true, force: true });
    });
  });
});
