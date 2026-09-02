import { loadExpoGoAwareModule } from "./loadExpoGoAwareModule";

// Null-safe requireNativeModule/requireNativeView — null in Expo Go instead of a crash.
export const resolveUnlessExpoGo = <T>(resolve: () => T): T | null =>
  loadExpoGoAwareModule<T | null>({ native: resolve, expoGo: () => null });
