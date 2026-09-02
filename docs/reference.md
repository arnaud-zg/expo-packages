[🏠 Home](../README.md) · [🚀 Tutorial](./tutorial.md) · [🛠️ How-to](./how-to.md) · **📖 Reference**
· [💡 Explanation](./explanation.md)

# 📖 Reference

## Packages and exports

| Package             | Subpath                 | Resolves to     | Needs                                                          |
| ------------------- | ----------------------- | --------------- | -------------------------------------------------------------- |
| `expo-native-guard` | `.`                     | `dist/index.js` | `expo`, `react`, `react-native` (peer deps)                    |
| `expo-native-guard` | `./core`                | `dist/core.js`  | nothing (no `react`/`react-native` import)                     |
| `expo-pnpm-catalog` | `.`                     | `dist/index.js` | nothing extra (bundles `chalk`, `commander`, `js-yaml`, `ora`) |
| `expo-pnpm-catalog` | bin `expo-pnpm-catalog` | `dist/cli.js`   | same                                                           |

`expo`, `react`, and `react-native` are peer dependencies of `expo-native-guard`, not bundled: a
consuming app always supplies its own, avoiding duplicate React instances. Ranges are floors, not
pins: `expo` requires `>=50.0.0`, the first SDK exporting `isRunningInExpoGo`; `react-native`
requires its paired minimum, `>=0.73.0`.

## `expo-native-guard` API

### `createExpoGoAwareComponent`

```ts
function createExpoGoAwareComponent<P extends object>(
  name: string,
  loaders: { native: () => ComponentType<P>; expoGo: () => ComponentType<P> },
): ComponentType<P>;
```

Picks between a native and an Expo Go component. The `expoGo` result is wrapped with
`withExpoGoIndicator(name)` automatically. Both loaders must be `require()` calls, not static
imports, see
[Explanation § Why the loaders must be `require()` calls](./explanation.md#why-the-loaders-must-be-require-calls-not-static-imports).

### `loadExpoGoAwareModule`

```ts
function loadExpoGoAwareModule<T>(loaders: { native: () => T; expoGo: () => T }): T;
```

The lower-level primitive `createExpoGoAwareComponent` is built on: picks between two loaders for
any value, not just a component. Also exported from `expo-native-guard/core`.

### `resolveUnlessExpoGo`

```ts
function resolveUnlessExpoGo<T>(resolve: () => T): T | null;
```

For a single native lookup (`requireNativeModule`/`requireNativeView`) rather than two full
implementations. Returns `null` in Expo Go instead of throwing. Equivalent to
`loadExpoGoAwareModule({ native: resolve, expoGo: () => null })`. Also exported from
`expo-native-guard/core`.

### `withExpoGoIndicator`

```ts
function withExpoGoIndicator<P extends object>(
  Component: ComponentType<P>,
  name: string,
): ComponentType<P>;
```

Wraps a component with a visible reminder that it's a stand-in: a dotted red border and a
`<name> · Expo Go` badge, built from plain `react-native` `View`/`Text`/`StyleSheet`, no other
dependency. `createExpoGoAwareComponent` applies this automatically; only needed directly when
composing `loadExpoGoAwareModule` by hand. Not exported from `expo-native-guard/core`: it renders a
real component, so it needs `react-native`.

## `expo-pnpm-catalog` API

### CLI

```
Usage: expo-pnpm-catalog check [options]

Options:
  --dry-run         show resolved versions per package without running expo-doctor
  --app-dir <path>  path to the Expo app (defaults to the current working directory)
```

```
Usage: expo-pnpm-catalog sync [options]

Options:
  --dry-run         show what would change without applying it
  -y, --yes         skip the confirmation prompt
  --app-dir <path>  path to the Expo app (defaults to the current working directory)
```

### Programmatic

```ts
type CatalogPaths = {
  rootDir: string; // root of the pnpm workspace (directory containing pnpm-workspace.yaml)
  appDir: string; // directory of the Expo app being checked/synced
  workspaceYamlPath: string; // absolute path to pnpm-workspace.yaml
  packageJsonPath: string; // absolute path to the Expo app's package.json
};

type CheckOptions = { dryRun: boolean };
type SyncOptions = { dryRun: boolean; yes: boolean };

function findWorkspaceRoot(startDir: string): string;
function runCheck(paths: CatalogPaths, options: CheckOptions): boolean;
function runSync(paths: CatalogPaths, options: SyncOptions): Promise<void>;
```

- `findWorkspaceRoot`: walks up from `startDir` until it finds a `pnpm-workspace.yaml`; throws if it
  reaches the filesystem root without finding one.
- `runCheck`: returns `true` if `expo-doctor` passed against the resolved manifest (`dryRun: true`
  always returns `true` without running it).
- `runSync`: writes to `pnpm-workspace.yaml` and runs `pnpm install` unless `dryRun: true`.
- Packages under `expo.install.exclude` in the Expo app's `package.json` are skipped by `runSync`,
  matching `expo install --fix`'s own exclusion behavior. See
  [How-to § Exclude a package from sync](./how-to.md#exclude-a-package-from-sync).

### How workspace packages are discovered

Top-level workspace directories to scan (e.g. `apps`, `packages`) come from the `packages:` globs
declared in `pnpm-workspace.yaml`. If none are declared, it falls back to `apps`, `packages`,
`tooling`.

## Package layout

```
packages/
  expo-native-guard/     src/index.ts (barrel), src/core.ts (no React import)
  expo-pnpm-catalog/     src/index.ts (programmatic API), src/cli.ts (bin entry point)
docs/                    this documentation
```

Each package's `dist/` (gitignored) is what its `package.json` `exports` actually resolve to.
`expo-native-guard` builds through `tsdown`; `expo-pnpm-catalog` builds through `tsc` directly,
since its `bin` entry point (`dist/cli.js`) isn't part of the `exports` map `tsdown` generates from.

## Scripts (for contributors to this repo)

| Script (from repo root)        | Runs                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `pnpm lint`                    | `eslint .`                                                                         |
| `pnpm lint:md`                 | `remark . --frail --quiet`                                                         |
| `pnpm format` / `format:check` | `prettier --write .` / `prettier --check .`                                        |
| `pnpm typecheck`               | `tsc` (or the package's typecheck config) in every package                         |
| `pnpm test`                    | `vitest run` in every package                                                      |
| `pnpm build`                   | builds every package (`tsdown` or `tsc`, per package)                              |
| `pnpm verify`                  | typecheck, lint, lint:md, format:check, test, build                                |
| `pnpm changeset`               | records a pending version bump, see [How-to](./how-to.md#release-a-new-version)    |
| `pnpm release`                 | `pnpm build && changeset publish`, see [How-to](./how-to.md#release-a-new-version) |
| `pnpm release:notes`           | `node scripts/release-notes.mjs`, see [How-to](./how-to.md#release-a-new-version)  |
