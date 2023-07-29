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
      return new Response(`Hello worker! ${new Date().toISOString()}`, {
        headers: {
          "Cache-Control": "max-age=10, stale-while-revalidate=5",
        },
      });
    }
  ),
};
