import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Lets `next dev` talk to the Cloudflare runtime (bindings, env) via OpenNext.
// The app uses no bindings today, so this is effectively a no-op in dev, but it
// keeps local dev consistent with the Workers runtime used in production.
initOpenNextCloudflareForDev();
