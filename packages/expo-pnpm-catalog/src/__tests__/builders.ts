/**
 * Test data builders for expo-pnpm-catalog types.
 * Each export is a factory returning a fresh builder to avoid state leakage.
 */
import { Builder } from "builder-pattern";

import type { PackageJson, WorkspaceYaml } from "../catalogUtils";

export const aWorkspaceYaml = () =>
  Builder<WorkspaceYaml>({
    catalog: {
      "some-lib": "^3.0.0",
    },
    catalogs: {
      expo: {
        "expo-camera": "~17.0.10",
        "@expo/vector-icons": "^15.0.3",
      },
    },
  });

export const aPackageJson = () =>
  Builder<PackageJson>({
    name: "@/app",
    dependencies: {
      "expo-camera": "catalog:expo",
    },
    devDependencies: {},
  });
