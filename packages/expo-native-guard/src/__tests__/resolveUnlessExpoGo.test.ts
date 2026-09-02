import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockIsRunningInExpoGo } from "./mockExpoGo";

describe("resolveUnlessExpoGo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("given the app is running in Expo Go, when resolving, then it returns null without calling resolve", async () => {
    mockIsRunningInExpoGo.mockReturnValue(true);
    const { resolveUnlessExpoGo } = await import("../resolveUnlessExpoGo");
    const resolve = vi.fn(() => "native-module-instance");

    const result = resolveUnlessExpoGo(resolve);

    expect(result).toBeNull();
    expect(resolve).not.toHaveBeenCalled();
  });

  it("given the app is not running in Expo Go, when resolving, then it returns whatever resolve produces", async () => {
    mockIsRunningInExpoGo.mockReturnValue(false);
    const { resolveUnlessExpoGo } = await import("../resolveUnlessExpoGo");
    const resolve = vi.fn(() => "native-module-instance");

    const result = resolveUnlessExpoGo(resolve);

    expect(result).toBe("native-module-instance");
    expect(resolve).toHaveBeenCalledOnce();
  });
});
