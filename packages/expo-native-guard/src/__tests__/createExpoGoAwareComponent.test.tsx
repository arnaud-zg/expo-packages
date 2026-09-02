import type { FC } from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockIsRunningInExpoGo } from "./mockExpoGo";

type StubProps = { label: string };

const Native: FC<StubProps> = ({ label }) => <Text testID="native">{label}</Text>;
const ExpoGo: FC<StubProps> = ({ label }) => <Text testID="expo-go">{label}</Text>;

describe("createExpoGoAwareComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("given the app is not running in Expo Go, when rendered, then it shows the native component with no indicator", async () => {
    mockIsRunningInExpoGo.mockReturnValue(false);
    const { createExpoGoAwareComponent } = await import("../createExpoGoAwareComponent");
    const Component = createExpoGoAwareComponent("Stub", {
      native: () => Native,
      expoGo: () => ExpoGo,
    });

    render(<Component label="hello" />);

    expect(screen.getByTestId("native")).toHaveTextContent("hello");
    expect(screen.queryByText("Stub · Expo Go")).toBeNull();
  });

  it("given the app is running in Expo Go, when rendered, then it shows the expoGo component wrapped with the indicator", async () => {
    mockIsRunningInExpoGo.mockReturnValue(true);
    const { createExpoGoAwareComponent } = await import("../createExpoGoAwareComponent");
    const Component = createExpoGoAwareComponent("Stub", {
      native: () => Native,
      expoGo: () => ExpoGo,
    });

    render(<Component label="hello" />);

    expect(screen.getByTestId("expo-go")).toHaveTextContent("hello");
    expect(screen.getByText("Stub · Expo Go")).toBeTruthy();
  });
});
