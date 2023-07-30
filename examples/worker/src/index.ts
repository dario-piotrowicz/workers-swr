/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { withSWR } from "workers-swr";

export interface Env {}

export default {
  fetch: withSWR(
    async (
      request: Request,
      env: Env,
      ctx: ExecutionContext
    ): Promise<Response> => {
      const url = new URL(request.url);
      const path = url.pathname;

      const { maxAge, swr, sie, error } = getDemoValues(request);

      return new Response(
        `
          <div>
            <p>Path: ${path}</p>
            <p>Current Time: ${new Date().toISOString()}</p>
            ${
              error
                ? `<p>Internal Server Error! (as requested)</p>`
                : `
                <p>requested max-age: ${maxAge}</p>
                <p>requested stale-while-revalidate: ${swr}</p>
                <p>requested stale-if-error: ${sie}</p>
              `
            }
          </div>
        `,
        {
          status: error ? 500 : 200,
          headers: {
            "content-type": "text/html;changeset=UTF-8",
            "Cache-Control": `max-age=${maxAge}, stale-while-revalidate=${swr}, stale-if-error=${sie}`,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
          },
        }
      );
    }
  ),
};

function getDemoValues(request: Request<unknown, CfProperties<unknown>>) {
  const demoValues = JSON.parse(
    request.headers.get("x-workers-swr-demo-request-values") ?? "{}"
  );

  const getDemoIntValue = (key: string) => {
    const parsedValue = parseInt(demoValues[key]);
    return isNaN(parsedValue) ? 0 : parsedValue;
  };

  return {
    maxAge: getDemoIntValue("maxAge"),
    swr: getDemoIntValue("swr"),
    sie: getDemoIntValue("sie"),
    error: !!demoValues.error,
  };
}
