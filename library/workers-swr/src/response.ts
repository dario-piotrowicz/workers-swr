import {
  extractCachingValues,
  generateUserHeadersFromWorkersCache,
} from "./headers";

/**
 * Generates a response to sent to the user from a cached response
 *
 * @param cachedResponse response from the workers cache
 * @returns response to send to the user
 */
export function generateResponseForUser(cachedResponse: Response): Response {
  const headersForResponse = generateUserHeadersFromWorkersCache(
    cachedResponse.headers
  );

  return new Response(cachedResponse.body, {
    ...cachedResponse,
    headers: headersForResponse,
  });
}

/**
 * Checks if a response is cached.
 *
 * If it is, it then checks if it is:
 *  - fresh
 *  - stale and should be revalidated (swr)
 *  - or stale and should override/cover a server error (sie)
 *
 * @param cachedResponse response from the workers cache
 * @returns object with the results of the checks
 */
export function getResponseCachingChecks(
  cachedResponse: Response | undefined
): ResponseCachingChecks {
  const cachingValues = cachedResponse
    ? extractCachingValues(cachedResponse)
    : null;

  if (!cachingValues) {
    return {
      isCached: false,
      isFresh: false,
      shouldBeRevalidated: false,
      shouldOverrideError: false,
    };
  }

  const { age, maxAge, swr, sie } = cachingValues;
  return {
    isCached: true,
    isFresh: age <= maxAge,
    shouldBeRevalidated: age > maxAge && age <= maxAge + (swr ?? 0),
    shouldOverrideError: age > maxAge && age <= maxAge + (sie ?? 0),
  };
}

type ResponseCachingChecks =
  | {
      isCached: false;
      isFresh: false;
      shouldBeRevalidated: false;
      shouldOverrideError: false;
    }
  | {
      isCached: true;
      isFresh: boolean;
      shouldBeRevalidated: boolean;
      shouldOverrideError: boolean;
    };
