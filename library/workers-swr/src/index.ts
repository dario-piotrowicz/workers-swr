export function withSWR<Env extends unknown>(fetchHandler: ExportedHandlerFetchHandler<Env, unknown>): ExportedHandlerFetchHandler {
	return async (request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> => {
		const swrCache = await caches.open('swr:cache');

		const cachedResponse = await swrCache.match(request);

		if(cachedResponse) {
			return cachedResponse;
		}

		const freshResponse = await fetchHandler(request as Parameters<ExportedHandlerFetchHandler>[0], env as Env, ctx);
		ctx.waitUntil(swrCache.put(request, freshResponse.clone()));

		return freshResponse;
	};
}