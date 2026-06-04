import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config: the app has no ISR / on-demand revalidation, so we don't
// wire an incremental cache (no extra R2 bucket needed). Card art is served
// from the public R2 bucket via plain URLs, not a Worker binding.
export default defineCloudflareConfig({});
