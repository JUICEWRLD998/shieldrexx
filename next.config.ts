import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WASM bindings on Windows cause the TS checker to crash in Next.js 16.
  // Type checking is handled by the editor (tsc). Re-enable when on Linux/Mac CI.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
