# Workers-SWR

Minimum requirements to implement:

- [] [Request Cache-Control Directives](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#request_directives) handling
  - [] ~~`no-cache`~~
  - [] ~~`no-store`~~
  - [] ~~`max-age`~~
  - [] `max-stale`
  - [] `min-fresh`
  - [] `only-if-cached`
- [] [Response Cache-Control Directives](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#response_directives) handling
  - [] ~~`max-age`~~
  - [] ~~`no-cache`~~
  - [] ~~`must-revalidate`~~
  - [] ~~`no-store`~~
  - [] ~~`private`~~
  - ~~[] `public`~~
  - [] ~~`immutable`~~
  - [] `stale-while-revalidate`
  - [] `stale-if-error`

Potentially a config parameter can be passed to `withSWR` to enable:

- [] `must-understand`

Regarding the crossed out entries above, it seems like the Workers Cache API [does](https://developers.cloudflare.com/workers/runtime-apis/cache/#headers) respect [most Cache-Control directives](https://developers.cloudflare.com/cache/concepts/cache-control#cache-control-directives), so I think that there is no need for the library to handled them.
