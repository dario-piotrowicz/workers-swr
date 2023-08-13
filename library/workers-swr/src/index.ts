import { cacheResponse, revalidateResponse } from "./cache";
import { generateResponseForUser, getResponseCachingChecks } from "./response";

export type SwrOptions = {
  /** Whether 304 responses should be returned or not (defaults to false) */
  enable304Responses: boolean;
};

const swrDefaultOptions: SwrOptions = {
  enable304Responses: false,
};

export function withSWR<Env extends unknown>(
  fetchHandler: ExportedHandlerFetchHandler<Env, unknown>,
  swrOptions: Partial<SwrOptions> = swrDefaultOptions
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

    const {
      isCached,
      isFresh,
      shouldBeRevalidated,
      shouldOverrideError,
      is304,
    } = getResponseCachingChecks(cachedResponse);

    if (isCached) {
      const isNotAllowed304 = is304 && !swrOptions.enable304Responses;
      const ignoreCachedResponse = isNotAllowed304;
      if (!ignoreCachedResponse) {
        if (isFresh) {
          return generateResponseForUser(cachedResponse!);
        }
        if (shouldBeRevalidated) {
          revalidateResponse(swrCache, runOriginalFetchHandler, request, ctx);
          return generateResponseForUser(cachedResponse!);
        }
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
