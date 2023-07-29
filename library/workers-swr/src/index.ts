import { cacheResponse } from "./cache";
import { extractCachingValues } from "./headers";
import { generateResponseForUser } from "./response";

export function withSWR<Env extends unknown>(
  fetchHandler: ExportedHandlerFetchHandler<Env, unknown>
): ExportedHandlerFetchHandler {
  return async (
    request: Request,
    env: unknown,
    ctx: ExecutionContext
  ): Promise<Response> => {
    const swrCache = await caches.open("swr:cache");

    const cachedResponse = await swrCache.match(request);

    const cachingValues = cachedResponse
      ? extractCachingValues(cachedResponse)
      : null;
    if (cachingValues) {
      return generateResponseForUser(cachedResponse!);
    }

    const freshResponse = await fetchHandler(
      request as Parameters<ExportedHandlerFetchHandler>[0],
      env as Env,
      ctx
    );

    cacheResponse(swrCache, freshResponse, request, ctx);

    return freshResponse;
  };
}
