import pluginReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [pluginReact()],
  resolve: {
    alias: [
      // react-native's Flow syntax breaks Vite/Rollup — react-native-web is a drop-in for tests.
      { find: /^react-native$/, replacement: "react-native-web" },
    ],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    watch: false,
  },
});
