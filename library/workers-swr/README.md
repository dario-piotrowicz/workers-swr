# Workers-SWR

Utility to add `stale-while-revalidate` and `stale-if-error` (see [rfc5861](https://httpwg.org/specs/rfc5861.html)) handling to [Cloudflare workers](https://workers.cloudflare.com/) via the
[Workers Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/#headers).

## Usage

The library is very minimalistic and requires almost no code changes, just install the library via:
```sh
npm i workers-swr
```

Then import and wrap your fetch handler with the provided `withSWR` function:
```ts
import { withSWR } from "workers-swr";

export default {
  fetch: withSWR(
    // your standard fetch handler goes here
    (request, env, ctx) => {
      return new Response('Hello World!');
    }
  ),
};
```

The library will check incoming requests and outgoing responses and implement the swr caching for you.

> **Warning**
> Note that the workers cache API, which this library uses, is not available in `*.workers.dev` deployments, in order to make use of it you need to deploy your worker to a custom domain.

> **Note**
> Cloudflare adds a default 4-hour max-age caching to fetch responses, this means that this library by default will make your responses be cached for 4 hours, you can easily change this by changing accordingly the _Browser Cache TTL_ option in the Cloudflare dashboard.

## Demo

Demo on how this library works ([source code](https://github.com/dario-piotrowicz/workers-swr/tree/main/examples/worker)): https://workers-swr-demo.dariopiot.net/


## To implement

### Essential items yet to be implemented

- [] [Request Cache-Control Directives](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#request_directives) handling
  > **Note**
  > `no-cache`, `no-store` and `max-age` are already handled by the workers cache api
  - [] `max-stale`
  - [] `min-fresh`
  - [] `only-if-cached`

### Items that could potentially be implemented (nice to have but not essential)

- [] adding a config parameter can be passed to `withSWR` to enable the `must-understand` directive

- [] adding the possibility to use a different caching storage (e.g. using KVs instead of the cache api, allowing caching also on `workers.dev` subdomains) (__important note: this would also need to make sure we handle all the [cache control directives that now the workers api handles for us](https://developers.cloudflare.com/cache/concepts/cache-control#cache-control-directives)__)
