import type { FC } from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withExpoGoIndicator } from "../withExpoGoIndicator";

type StubProps = { label: string };

const Stub: FC<StubProps> = ({ label }) => <Text testID="stub">{label}</Text>;

describe("withExpoGoIndicator", () => {
  it("given a wrapped component, when rendered, then the original component still renders with its props", () => {
    const Wrapped = withExpoGoIndicator(Stub, "CameraView");

    render(<Wrapped label="hello" />);

    expect(screen.getByTestId("stub")).toHaveTextContent("hello");
  });

  it("given a component name, when rendered, then it shows a short label with the name and Expo Go", () => {
    const Wrapped = withExpoGoIndicator(Stub, "CameraView");

    render(<Wrapped label="hello" />);

    expect(screen.getByText("CameraView · Expo Go")).toBeTruthy();
  });

  it("given two different wrapped components, when rendered, then each shows its own name", () => {
    const WrappedA = withExpoGoIndicator(Stub, "CameraView");
    const WrappedB = withExpoGoIndicator(Stub, "MascotView");

    render(<WrappedA label="a" />);
    render(<WrappedB label="b" />);

    expect(screen.getByText("CameraView · Expo Go")).toBeTruthy();
    expect(screen.getByText("MascotView · Expo Go")).toBeTruthy();
  });

  it("given a component name, when wrapped, then the wrapper's displayName identifies both the helper and the component", () => {
    const Wrapped = withExpoGoIndicator(Stub, "CameraView");

    expect(Wrapped.displayName).toBe("withExpoGoIndicator(CameraView)");
  });
});
