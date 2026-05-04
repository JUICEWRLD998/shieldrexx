import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WASM bindings on Windows cause the TS checker to crash in Next.js 16.
  // Type checking is handled by the editor (tsc). Re-enable when on Linux/Mac CI.
  typescript: { ignoreBuildErrors: true },
  webpack(config) {
    // snarkjs → ffjavascript → web-worker uses a dynamic require expression
    // that is valid at runtime but triggers a non-fatal webpack critical-dependency
    // warning in the browser bundle. Suppress it.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /web-worker[\\/]cjs[\\/]node\.js/ },
    ];
    return config;
  },
};

export default nextConfig;
