---
"expo-pnpm-catalog": patch
---

`sync --yes` now works in CI. It updates the lockfile with `pnpm install --lockfile-only`, which CI
allows, then installs with `--frozen-lockfile`, instead of a plain `pnpm install` that failed with
`ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` where `CI=true`.
