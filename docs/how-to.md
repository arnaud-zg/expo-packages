[🏠 Home](../README.md) · [🚀 Tutorial](./tutorial.md) · **🛠️ How-to** ·
[📖 Reference](./reference.md) · [💡 Explanation](./explanation.md)

# 🛠️ How-to guides

## Pick a package

| You're hitting                                                                           | Install             | What it does                                                                                  |
| ---------------------------------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------- |
| Expo Go crashing on a native-only import (Nitro module, TurboModule, custom Expo module) | `expo-native-guard` | Swaps in a visible fallback component instead of crashing                                     |
| Expo SDK dependency versions drifting out of sync across a pnpm catalog                  | `expo-pnpm-catalog` | Runs `expo-doctor` / `expo install --fix` against resolved catalog versions, syncs drift back |

Both are dev/regular dependencies of your app, not of each other — installing one never pulls in the
other.

## Guard a native-only component

Give `createExpoGoAwareComponent` a name plus one loader per implementation. Both loaders must be
`require()` calls, not static imports — see
[Explanation § Why the loaders must be `require()` calls](./explanation.md#why-the-loaders-must-be-require-calls-not-static-imports):

```tsx
import { createExpoGoAwareComponent } from "expo-native-guard";

export const CameraView = createExpoGoAwareComponent("CameraView", {
  native: () => require("./CameraView").CameraView,
  expoGo: () => require("./CameraView.expoGo").CameraView,
});
```

The `expoGo` result is wrapped with `withExpoGoIndicator` automatically, see
[Reference § `withExpoGoIndicator`](./reference.md#withexpogoindicator) for what that renders.

## Guard a single native lookup instead of two full implementations

For a single `requireNativeModule`/`requireNativeView` call rather than a native/Expo Go pair, use
`resolveUnlessExpoGo`. It returns `null` in Expo Go instead of throwing, so the caller falls back to
a plain JS/RN implementation:

```ts
import { resolveUnlessExpoGo } from "expo-native-guard";

const NativeView = resolveUnlessExpoGo(() => requireNativeView<Props>("MyNativeView"));

export default function MyView(props: Props) {
  const View = NativeView ?? MyFallbackView;
  return <View {...props} />;
}
```

## Use the branching logic without a React import

`loadExpoGoAwareModule` and `resolveUnlessExpoGo` are also available from `expo-native-guard/core` —
no `react`/`react-native` import, for callers that only need the branching logic and would otherwise
pull in a React shim for nothing:

```ts
import { loadExpoGoAwareModule } from "expo-native-guard/core";

const CameraModule = loadExpoGoAwareModule({
  native: () => require("./CameraModule").CameraModule,
  expoGo: () => require("./CameraModule.expoGo").CameraModule,
});
```

The full `expo-native-guard` barrel (used in the two recipes above) also exports
`withExpoGoIndicator`, a real `react-native` component — pull from `/core` instead whenever a file
doesn't render anything itself.

## Check Expo SDK versions against a pnpm catalog

Mirrors what `expo-doctor` would see in CI, against every `catalog:*` reference in the Expo app and
in every other workspace package that shares an Expo-managed dependency:

```sh
npx expo-pnpm-catalog check --app-dir apps/expo
```

Add `--dry-run` to print the resolved version table without running `expo-doctor`:

```sh
npx expo-pnpm-catalog check --app-dir apps/expo --dry-run
```

## Sync a pnpm catalog with the current Expo SDK

Runs `expo install --fix` against the resolved manifest, then writes whatever it changes back into
the matching `catalogs.*` section of `pnpm-workspace.yaml` (comments and formatting preserved) and
runs `pnpm install`:

```sh
npx expo-pnpm-catalog sync --app-dir apps/expo
```

`--dry-run` shows the pending version changes without writing them; `-y`/`--yes` skips the
confirmation prompt, useful in CI:

```sh
npx expo-pnpm-catalog sync --app-dir apps/expo --dry-run
npx expo-pnpm-catalog sync --app-dir apps/expo --yes
```

## Exclude a package from sync

Add it to `expo.install.exclude` in the Expo app's `package.json` — `sync` skips any package listed
there, matching `expo install --fix`'s own exclusion behavior:

```json
{
  "expo": {
    "install": {
      "exclude": ["react-native-reanimated"]
    }
  }
}
```

## Use `expo-pnpm-catalog` programmatically

```ts
import path from "path";
import { findWorkspaceRoot, runCheck, runSync } from "expo-pnpm-catalog";

const appDir = path.resolve("apps/expo");
const rootDir = findWorkspaceRoot(appDir);
const paths = {
  appDir,
  rootDir,
  workspaceYamlPath: path.join(rootDir, "pnpm-workspace.yaml"),
  packageJsonPath: path.join(appDir, "package.json"),
};

const passed = runCheck(paths, { dryRun: false });
await runSync(paths, { dryRun: false, yes: true });
```

See [Reference § `expo-pnpm-catalog` API](./reference.md#expo-pnpm-catalog-api) for `CatalogPaths`,
`CheckOptions`, and `SyncOptions`.

## Run this repo's own tests

```sh
pnpm install
pnpm verify
```

Or scope to one package:

```sh
pnpm --filter expo-native-guard test
pnpm --filter expo-pnpm-catalog test
```

## Release a new version

Uses [Changesets](https://github.com/changesets/changesets). Nobody pushes to `main` directly,
including for version bumps: everything lands through a merged PR.

**1. Add a changeset, in your feature/fix PR**

```sh
pnpm changeset
```

Each merged PR carries its own changeset; they pile up on `main` until step 2 cuts a release. Commit
the generated `.changeset/*.md` file and merge the PR as usual.

A package that has never been published needs no changeset for its first version: set the version
directly in its `package.json` (e.g. `0.1.0`) when you add the package, and `changeset publish`
picks it up automatically once merged, since the registry has nothing at that version yet.

**2. Cut the release PR, once changesets have piled up on `main`**

```sh
git checkout main
git checkout -b release/$(date +%Y-%m-%d)
pnpm changeset version && pnpm install
git commit -am "chore(release): version packages"
git push -u origin HEAD
gh pr create --title "chore(release): version packages" --fill
```

Copy this into the PR description, filling in the version column from the `package.json` diffs:

```markdown
## Releases

| Package             | Version |
| ------------------- | ------- |
| `expo-pnpm-catalog` | 0.0.0   |
| `expo-native-guard` | 0.0.0   |
```

Review the diff (version bumps + `CHANGELOG.md`) and merge it like any other PR.

**3. Publish, from your machine, after that PR is merged**

```sh
git checkout main
npm login          # if you don't already have a session
pnpm release        # build, then changeset publish (also tags each bumped package)
git push --follow-tags
pnpm release:notes  # create a GitHub Release, per package, from that CHANGELOG.md entry
```

`pnpm release:notes` needs `gh` authenticated and is safe to re-run: it skips any tag that already
has a release.

One-time setup: **Settings → Branches** → require a PR before merging into `main`, so steps 1 and 2
are the only way in. (Needs the repo to be public, or GitHub Pro, for a private repo.)

Packages version independently, not in lockstep: a fix to one package doesn't force a version bump
on the other. Both start at `0.1.0`: usable, not yet stable, expect breaking changes signaled by a
`0.x` minor bump until `1.0.0`. See
[Explanation § Versioning policy](./explanation.md#versioning-policy) for why.
