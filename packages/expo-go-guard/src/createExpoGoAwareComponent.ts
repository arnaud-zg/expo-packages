import type { ComponentType } from "react";

import { loadExpoGoAwareModule } from "./loadExpoGoAwareModule";
import { withExpoGoIndicator } from "./withExpoGoIndicator";

// Mirrors createDatabaseBackedProvider(token, { postgres, sqlite }) — auto-applies the indicator.
export const createExpoGoAwareComponent = <P extends object>(
  name: string,
  loaders: { native: () => ComponentType<P>; expoGo: () => ComponentType<P> },
): ComponentType<P> =>
  loadExpoGoAwareModule<ComponentType<P>>({
    native: loaders.native,
    expoGo: () => withExpoGoIndicator(loaders.expoGo(), name),
  });
