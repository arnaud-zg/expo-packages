---
"expo-pnpm-catalog": patch
---

`sync --yes` now works in CI. It installs with `--no-frozen-lockfile`, so the lockfile follows the
catalog it just wrote instead of failing with `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` where `CI=true`.
