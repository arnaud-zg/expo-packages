import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockIsRunningInExpoGo } from "./mockExpoGo";

describe("loadExpoGoAwareModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("given the app is running in Expo Go, when loading, then only the expoGo loader runs", async () => {
    mockIsRunningInExpoGo.mockReturnValue(true);
    const { loadExpoGoAwareModule } = await import("../loadExpoGoAwareModule");
    const native = vi.fn(() => "native");
    const expoGo = vi.fn(() => "expo-go");

    const result = loadExpoGoAwareModule({ native, expoGo });

    expect(result).toBe("expo-go");
    expect(native).not.toHaveBeenCalled();
    expect(expoGo).toHaveBeenCalledOnce();
  });

  it("given the app is not running in Expo Go, when loading, then only the native loader runs", async () => {
    mockIsRunningInExpoGo.mockReturnValue(false);
    const { loadExpoGoAwareModule } = await import("../loadExpoGoAwareModule");
    const native = vi.fn(() => "native");
    const expoGo = vi.fn(() => "expo-go");

    const result = loadExpoGoAwareModule({ native, expoGo });

    expect(result).toBe("native");
    expect(expoGo).not.toHaveBeenCalled();
    expect(native).toHaveBeenCalledOnce();
  });
});
