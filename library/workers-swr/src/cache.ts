import { processCacheControlForWorkersCache } from "./cacheControl";

/**
 * caches a response if it has a Cache-Control header
 *
 * it also processes/adjusts the response's Cache-Control header for
 * storing in the workers cache
 *
 * @param cache workers cache to store the response in
 * @param response response to cache (as the cache value)
 * @param request request to cache (as the cache key)
 * @param ctx execution context
 */
export function cacheResponse(
  cache: Cache,
  response: Response,
  request: Request<unknown, CfProperties<unknown>>,
  ctx: ExecutionContext
): void {
  const responseToBeCached = response.clone();
  const cacheControlForWorkersCache = processCacheControlForWorkersCache(
    response.headers.get("Cache-Control")
  );
  if (cacheControlForWorkersCache) {
    responseToBeCached.headers.set(
      "Cache-Control",
      cacheControlForWorkersCache
    );
    ctx.waitUntil(cache.put(request, responseToBeCached));
  }
}
