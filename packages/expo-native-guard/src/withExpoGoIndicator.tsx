import type { ComponentType } from "react";
import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 2,
    borderStyle: "dotted",
    borderColor: "#FF3B30",
  },
  badge: {
    position: "absolute",
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
});

// Flags the Expo Go fallback on screen — a reminder the native path is separate code that still
// needs its own test pass before shipping. Only ever renders inside an `expoGo` loader.
export const withExpoGoIndicator = <P extends object>(
  Component: ComponentType<P>,
  name: string,
): ComponentType<P> => {
  const WithExpoGoIndicator = (props: P) => (
    <View style={styles.container}>
      <Component {...props} />
      <View style={styles.badge} pointerEvents="none">
        <Text style={styles.label} numberOfLines={1}>
          {name} · Expo Go
        </Text>
      </View>
    </View>
  );

  WithExpoGoIndicator.displayName = `withExpoGoIndicator(${name})`;

  return WithExpoGoIndicator;
};
