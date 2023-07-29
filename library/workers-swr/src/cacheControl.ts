/**
 * Processes the Cache-Control header for storing in the workers cache, this is necessary
 * because the workers cache doesn't handle `stale-while-revalidate` and `stale-if-error`,
 * so we need to adjust the max-age accordingly to account for such values
 *
 * e.g.
 *  If the response's Cache-Control is:
 *    "max-age=10, stale-while-revalidate=5, stale-if-error=3"
 *  it needs to be stored as:
 *    "max-age=18" (10 + 5 + 3)
 *  and we need to store in separate headers the
 *  stale-while-revalidate and stale-if-error directives
 *
 * Note: storing the stale-while-revalidate and stale-if-error directives separately
 *       is not really necessary but it's done to future proof this solution, if in
 *       the future the workers cache decides to honor the directives, having them
 *       stored separately would make this solution still work as intended, if they
 *       were instead left in the Cache-Control header the lifespan of the cached
 *       response would get unintentionally increased (as each directive would be
 *       accounting for twice)
 *
 * @param requestCacheControl Cache control header from the request
 * @returns headers to apply to the request before storing it in the workers cache, or null
 *          if no cache control was provided
 */
export function processCacheControlForWorkersCache(
  requestCacheControl: string | null
): HeadersForWorkersCache | null {
  if (!requestCacheControl) {
    return null;
  }

  return {
    'Cache-Control': requestCacheControl,
  };
}

type WorkersSwrMetadataHeaders = `x-workers-swr-metadata-${'stale-while-revalidate'|'stale-if-error'}`;

type HeadersForWorkersCache = {
  'Cache-Control': string;
} & {
  [Key in WorkersSwrMetadataHeaders]?: string;
};
