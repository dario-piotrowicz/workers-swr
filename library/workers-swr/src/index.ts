import { cacheResponse, revalidateResponse } from "./cache";
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
    const runOriginalFetchHandler = () => {
      return fetchHandler(
        request as Parameters<ExportedHandlerFetchHandler>[0],
        env as Env,
        ctx
      );
    };

    const swrCache = await caches.open("swr:cache");

    const cachedResponse = await swrCache.match(request);

    const cachingValues = cachedResponse
      ? extractCachingValues(cachedResponse)
      : null;
    if (cachingValues) {
      if(cachingValues.age <= cachingValues["max-age"]) {
        return generateResponseForUser(cachedResponse!);
      }
      if(cachingValues.age <= cachingValues["max-age"] + (cachingValues.swr ?? 0)) {
        revalidateResponse(swrCache, runOriginalFetchHandler, request, ctx);
        return generateResponseForUser(cachedResponse!);
      }
    }

    let freshResponse: Response;
    try {
      freshResponse = await runOriginalFetchHandler();
    } catch (e) {
      if(cachingValues && cachingValues.age > cachingValues["max-age"] && cachingValues.age <= cachingValues["max-age"] + (cachingValues.sie ?? 0)) {
        return cachedResponse!;
      }
      throw e;
    }
    if(freshResponse.status >= 500) {
      if(cachingValues && cachingValues.age > cachingValues["max-age"] && cachingValues.age <= cachingValues["max-age"] + (cachingValues.sie ?? 0)) {
        return cachedResponse!;
      }
    }

    cacheResponse(swrCache, freshResponse, request, ctx);
    return freshResponse;
  };
}
