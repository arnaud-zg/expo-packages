import { vi } from "vitest";

const mockIsRunningInExpoGo = vi.hoisted(() => vi.fn());

vi.mock("expo", () => ({
  isRunningInExpoGo: mockIsRunningInExpoGo,
}));

export { mockIsRunningInExpoGo };
