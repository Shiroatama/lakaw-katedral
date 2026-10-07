import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * All tour routes are static (SSG). Use Workers Static Assets for the
 * incremental cache; no R2 / queue / tag cache needed.
 * @see https://opennext.js.org/cloudflare/caching#ssg-site
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
