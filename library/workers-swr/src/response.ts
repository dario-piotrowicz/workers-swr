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
