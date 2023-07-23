export function withSWR<Env extends unknown>(fetchHandler: ExportedHandlerFetchHandler<Env, unknown>): ExportedHandlerFetchHandler {
	return async (request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> => {
		return  fetchHandler(request as Parameters<ExportedHandlerFetchHandler>[0], env as Env, ctx);
	};
}