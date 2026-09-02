import { describe, expect, it } from "vitest";

import type { WorkspaceYaml } from "../catalogUtils";
import { resolveCatalogRefs, updateVersionInYaml } from "../catalogUtils";

const workspace: WorkspaceYaml = {
  catalog: {
    eslint: "^9.0.0",
    zod: "4.0.0",
  },
  catalogs: {
    expo: {
      "expo-camera": "~17.0.10",
      "@expo/vector-icons": "^15.0.3",
    },
    react: {
      react: "19.1.0",
    },
  },
};

describe("catalog version resolution", () => {
  describe("given a package uses the root catalog", () => {
    it("when resolved, then its concrete version is used", () => {
      const result = resolveCatalogRefs({ eslint: "catalog:" }, workspace);
      expect(result.eslint).toBe("^9.0.0");
    });
  });

  describe("given a package uses a named catalog", () => {
    it("when resolved with catalog:expo, then the expo catalog version is used", () => {
      const result = resolveCatalogRefs({ "expo-camera": "catalog:expo" }, workspace);
      expect(result["expo-camera"]).toBe("~17.0.10");
    });

    it("when a scoped package references the expo catalog, then its version is resolved correctly", () => {
      const result = resolveCatalogRefs({ "@expo/vector-icons": "catalog:expo" }, workspace);
      expect(result["@expo/vector-icons"]).toBe("^15.0.3");
    });

    it("when resolved with catalog:react, then the correct named catalog version is used", () => {
      const result = resolveCatalogRefs({ react: "catalog:react" }, workspace);
      expect(result.react).toBe("19.1.0");
    });
  });

  describe("given a package already has a concrete version", () => {
    it("when resolved, then the version passes through untouched", () => {
      const result = resolveCatalogRefs({ zustand: "5.0.6" }, workspace);
      expect(result.zustand).toBe("5.0.6");
    });
  });

  describe("given a package references a catalog entry that does not exist", () => {
    it("when resolved, then the original reference is preserved as a fallback", () => {
      const result = resolveCatalogRefs({ unknown: "catalog:" }, workspace);
      expect(result.unknown).toBe("catalog:");
    });
  });
});

describe("patching versions in pnpm-workspace.yaml", () => {
  describe("given a package key is unquoted in the yaml", () => {
    it("when patched, then the new version is written with quotes", () => {
      const content = `  expo-camera: "~17.0.8"`;
      const result = updateVersionInYaml(content, "expo-camera", "~17.0.10");
      expect(result).toBe(`  expo-camera: "~17.0.10"`);
    });
  });

  describe("given a scoped package has a quoted key", () => {
    it("when patched, then the scoped package version is updated correctly", () => {
      const content = `  "@expo/vector-icons": "^15.0.1"`;
      const result = updateVersionInYaml(content, "@expo/vector-icons", "^15.0.3");
      expect(result).toBe(`  "@expo/vector-icons": "^15.0.3"`);
    });
  });

  describe("given the yaml has comments above the package entry", () => {
    it("when patched, then comments survive the update", () => {
      const content = [
        "  # Expo-managed dependencies",
        `  expo-camera: "~17.0.8"`,
        `  expo-font: "~14.0.0"`,
      ].join("\n");

      const result = updateVersionInYaml(content, "expo-camera", "~17.0.10");

      expect(result).toContain("# Expo-managed dependencies");
      expect(result).toContain(`expo-camera: "~17.0.10"`);
      expect(result).toContain(`expo-font: "~14.0.0"`);
    });
  });

  describe("given the package is not present in the yaml", () => {
    it("when patched, then the file is left untouched", () => {
      const content = `  expo-font: "~14.0.0"`;
      const result = updateVersionInYaml(content, "expo-camera", "~17.0.10");
      expect(result).toBe(content);
    });
  });
});
