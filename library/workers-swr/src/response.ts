import { ResponseCachingValues } from "./cache";
import { generateUserHeadersFromWorkersCache } from "./headers";

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
 * Checks if a response is fresh (according to its caching values)
 *
 * @param cachingValues caching values from a response
 * @returns true if the response is fresh, false otherwise
 */
export function isResponseFresh({
  age,
  maxAge,
}: ResponseCachingValues): boolean {
  return age <= maxAge;
}

/**
 * Checks if a response is stale and should be revalidated (according to its caching values)
 *
 * Note: with "revalidated" here we mean both that the response should be revalidated and
 *       that the user should be served the stale cached response
 *
 * @param cachingValues caching values from a response
 * @returns true if the response is stale and should be revalidated, false otherwise
 */
export function shouldResponseBeRevalidated({
  age,
  maxAge,
  swr,
}: ResponseCachingValues): boolean {
  return age > maxAge && age <= maxAge + (swr ?? 0);
}

/**
 * Checks if a response is stale and should be returned to override/cover a server error (according to its caching values)
 *
 * @param cachingValues caching values from a response
 * @returns true if the response is stale and should override/cover a server error, false otherwise
 */
export function shouldResponseOverrideError({
  age,
  maxAge,
  sie,
}: ResponseCachingValues): boolean {
  return age > maxAge && age <= maxAge + (sie ?? 0);
}
