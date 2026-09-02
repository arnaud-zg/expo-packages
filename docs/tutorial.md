[🏠 Home](../README.md) · **🚀 Tutorial** · [🛠️ How-to](./how-to.md) ·
[📖 Reference](./reference.md) · [💡 Explanation](./explanation.md)

# 🚀 Getting started

Two independent, standalone tools — pick whichever matches what you're hitting. Installing one never
pulls in the other.

## `expo-native-guard`: stop a native-only import from crashing Expo Go

Expo Go only bundles Expo's own native modules. Any package with its own native binding — a Nitro
module, a TurboModule, a custom Expo module — throws at import or resolution time when it isn't
there. This walks through swapping in a visible fallback instead.

### 1. Install

```sh
npm install expo-native-guard
```

### 2. Write a native implementation and an Expo Go fallback

Two files, same shape — here, a native camera view and a placeholder for Expo Go:

```tsx
// CameraView.tsx
import { requireNativeViewManager } from "expo-modules-core";

export const CameraView = requireNativeViewManager("MyCamera");
```

```tsx
// CameraView.expoGo.tsx
import { Text, View } from "react-native";

export const CameraView = () => (
  <View>
    <Text>Camera preview isn't available in Expo Go.</Text>
  </View>
);
```

### 3. Wire them together with `createExpoGoAwareComponent`

```tsx
// index.tsx
import { createExpoGoAwareComponent } from "expo-native-guard";

export const CameraView = createExpoGoAwareComponent("CameraView", {
  native: () => require("./CameraView").CameraView,
  expoGo: () => require("./CameraView.expoGo").CameraView,
});
```

Both loaders are `require()` calls, not static imports — that matters, see
[Explanation](./explanation.md#why-the-loaders-must-be-require-calls-not-static-imports).

### 4. Run it

```sh
npx expo start
```

Open the app in **Expo Go**: `CameraView` renders the fallback, wrapped in a dotted red border with
a `CameraView · Expo Go` badge — a visible reminder this is a stand-in, not the real thing. Open the
same code in a **dev client** or a production build: `CameraView` renders the native view instead,
no badge.

Done. `expo-native-guard` is wired up. For the lower-level primitives (`loadExpoGoAwareModule`,
`resolveUnlessExpoGo`, a `react`-free import) see
[How-to guides](./how-to.md#guard-a-native-only-component).

## `expo-pnpm-catalog`: keep Expo SDK versions in sync across a pnpm catalog

If your Expo app's dependencies are pinned through a [pnpm catalog](https://pnpm.io/catalogs)
(`catalog:` or `catalog:expo`), `expo-doctor` and `expo install --fix` can't read those references
directly — they expect concrete version strings. This walks through checking and syncing them
instead.

Needs a pnpm workspace (a `pnpm-workspace.yaml` above your Expo app) with the app's Expo-managed
dependencies declared as `catalog:` references, e.g. `"expo-camera": "catalog:expo"`.

### 1. Install

```sh
npm install --save-dev expo-pnpm-catalog
```

### 2. Add scripts

```json
// package.json (workspace root)
{
  "scripts": {
    "catalog:check": "expo-pnpm-catalog check --app-dir apps/expo",
    "catalog:sync": "expo-pnpm-catalog sync --app-dir apps/expo"
  }
}
```

### 3. Check for drift

```sh
pnpm catalog:check
```

Resolves every `catalog:*` reference — in the Expo app, and in every other workspace package that
shares an Expo-managed dependency — to its concrete version, runs `expo-doctor` against that
resolved manifest, then restores the original `package.json`, pass or fail.

### 4. Fix drift when it's found

```sh
pnpm catalog:sync
```

Runs `expo install --fix` to compute the versions the current Expo SDK actually wants, shows a
from/to table, and — after you confirm — writes them back into `pnpm-workspace.yaml`'s matching
`catalogs.*` section and runs `pnpm install`.

Done. Re-run `catalog:check` to confirm it's clean. For `--dry-run`, `-y`/`--yes`, excluding a
package, or the programmatic API, see
[How-to guides](./how-to.md#check-expo-sdk-versions-against-a-pnpm-catalog).
