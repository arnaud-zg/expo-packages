# 📦 expo-packages

<p align="center">
  <img src="assets/icon.png" width="128" height="128" alt="expo-packages logo" />
</p>

<div align="center">
  <b>Small, focused tools for Expo monorepos, each one standalone, no shared runtime between them.</b>
</div>

---

<div align="center">

<!-- Badges -->

<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
<a href="https://pnpm.io/"><img src="https://img.shields.io/badge/Powered%20by-pnpm%20workspaces-F69220?logo=pnpm&logoColor=white" alt="Powered by pnpm workspaces"></a>
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" alt="TypeScript"></a>
<a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D22-339933?logo=node.js&logoColor=white" alt="Node >=22"></a>
<br/>
<a href="https://www.npmjs.com/package/expo-pnpm-catalog"><img src="https://img.shields.io/npm/v/expo-pnpm-catalog.svg?label=expo-pnpm-catalog" alt="expo-pnpm-catalog npm version"></a>
<a href="https://www.npmjs.com/package/expo-native-guard"><img src="https://img.shields.io/npm/v/expo-native-guard.svg?label=expo-native-guard" alt="expo-native-guard npm version"></a>
<br/>
<a href="https://npm-stat.com/charts.html?package=expo-pnpm-catalog"><img src="https://img.shields.io/npm/dm/expo-pnpm-catalog.svg?label=expo-pnpm-catalog" alt="expo-pnpm-catalog npm downloads"></a>
<a href="https://npm-stat.com/charts.html?package=expo-native-guard"><img src="https://img.shields.io/npm/dm/expo-native-guard.svg?label=expo-native-guard" alt="expo-native-guard npm downloads"></a>

</div>

---

## 📦 Packages

| Package                                             | What it's for                                                                                                                          |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [`expo-pnpm-catalog`](./packages/expo-pnpm-catalog) | Deterministic Expo SDK checks and sync for pnpm catalogs, like `expo-doctor` for a whole workspace                                     |
| [`expo-native-guard`](./packages/expo-native-guard) | Resolve or select native-only implementations without crashing in Expo Go, with a visible reminder the native path still needs testing |

Each package is independently versioned and publishes on its own, installing one never pulls in the
other.

```sh
npm install --save-dev expo-pnpm-catalog
npm install expo-native-guard
```

See each package's own README for usage: [`expo-pnpm-catalog`](./packages/expo-pnpm-catalog#readme),
[`expo-native-guard`](./packages/expo-native-guard#readme).

## 🤝 Contributing

```sh
pnpm install
pnpm verify
```

Released independently per package with [Changesets](https://github.com/changesets/changesets); see
[How-to § Release a new version](./docs/how-to.md#release-a-new-version).

## License

MIT
