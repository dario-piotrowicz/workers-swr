import { cacheResponse, revalidateResponse } from "./cache";
import { generateResponseForUser, getResponseCachingChecks } from "./response";

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

    if (request.method !== "GET") {
      // only GET requests can be cached so we just stop here
      // if the request is not a GET one
      return runOriginalFetchHandler();
    }

    const swrCache = await caches.open("swr:cache");

    const cachedResponse = await swrCache.match(request);

    const { isCached, isFresh, shouldBeRevalidated, shouldOverrideError } =
      getResponseCachingChecks(cachedResponse);

    if (isCached) {
      if (isFresh) {
        return generateResponseForUser(cachedResponse!);
      }
      if (shouldBeRevalidated) {
        revalidateResponse(swrCache, runOriginalFetchHandler, request, ctx);
        return generateResponseForUser(cachedResponse!);
      }
    }

    let freshResponse: Response;
    try {
      freshResponse = await runOriginalFetchHandler();
    } catch (e) {
      if (isCached && shouldOverrideError) {
        return cachedResponse!;
      }
      throw e;
    }
    if (freshResponse.status >= 500 && isCached && shouldOverrideError) {
      return cachedResponse!;
    }

    cacheResponse(swrCache, freshResponse, request, ctx);
    return freshResponse;
  };
}
