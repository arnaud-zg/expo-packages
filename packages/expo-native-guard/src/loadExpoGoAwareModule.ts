import { isRunningInExpoGo } from "expo";

// Loaders must be require() calls, not static imports — Metro evaluates those eagerly, crashing
// Expo Go on native-only modules regardless of which branch actually runs.
export const loadExpoGoAwareModule = <T>(loaders: { native: () => T; expoGo: () => T }): T =>
  isRunningInExpoGo() ? loaders.expoGo() : loaders.native();
