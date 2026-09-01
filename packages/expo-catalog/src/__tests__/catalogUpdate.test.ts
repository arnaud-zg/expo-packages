import { describe, expect, it } from "vitest";

import { CatalogUpdate } from "../catalogUpdate";

describe("version update detection", () => {
  describe("given a package is already at the correct version", () => {
    it("when compared, then no update is produced", () => {
      expect(CatalogUpdate.between("expo-camera", "~17.0.10", "~17.0.10")).toBeNull();
    });
  });

  describe("given a package has no current version recorded", () => {
    it("when compared, then no update is produced", () => {
      expect(CatalogUpdate.between("expo-camera", "", "~17.0.10")).toBeNull();
    });
  });

  describe("given expo tooling did not return a version", () => {
    it("when compared, then no update is produced", () => {
      expect(CatalogUpdate.between("expo-camera", "~17.0.8", "")).toBeNull();
    });
  });

  describe("given a package is outdated", () => {
    it("when compared, then an update is produced with the old and new versions", () => {
      const update = CatalogUpdate.between("expo-camera", "~17.0.8", "~17.0.10");

      expect(update).not.toBeNull();
      expect(update?.name).toBe("expo-camera");
      expect(update?.from).toBe("~17.0.8");
      expect(update?.to).toBe("~17.0.10");
    });
  });
});
