/**
 * Generates headers to apply to the response before adding it to the cache, this includes
 * updating the Cache-Control header and also add other (metadata used just for workers-swr) headers.
 *
 * This is necessary because the workers cache doesn't handle `stale-while-revalidate` and `stale-if-error`,
 * so we need to adjust things accordingly
 *
 * For example:
 *  If the response's Cache-Control is:
 *    "max-age=10, stale-while-revalidate=5, stale-if-error=3"
 *  it needs to be updated to:
 *    "max-age=15" (10 + Max(5, 3))
 *  (so that the response is correctly held in the cache for 15 seconds and not evicted after 10)
 *  also the stale-while-revalidate and stale-if-error directives need to be saved in separate headers
 *  so that we can use them later on
 *
 * Note: storing the stale-while-revalidate and stale-if-error directives separately is not really
 *       necessary, we could have kept them in the Cache-Control header, but we don't to future proof
 *       the solution, if in the future the workers cache decides to honor the directives, having them
 *       stored separately would make this solution still work as intended, if they were instead left
 *       in the Cache-Control header the lifespan of the cached response would get unintentionally
 *       increased (as each directive would be accounted for twice)
 *
 * @param responseCacheControl Cache control header from the response
 * @returns headers to apply to the response before storing it in the workers cache, or null
 *          if no cache control was provided
 */
export function generateHeadersForWorkersCache(
  responseCacheControl: string | null
): HeadersForWorkersCache | null {
  if (!responseCacheControl) {
    return null;
  }

  const directives = collectDirectivesAndValues(responseCacheControl);

  const maxAgeValue = getNumberValue(directives, "max-age");
  const swrValue = getNumberValue(directives, "stale-while-revalidate");
  const sieValue = getNumberValue(directives, "stale-if-error");

  return {
    "Cache-Control": Object.entries(directives)
      .filter(
        ([directive]) =>
          !["stale-while-revalidate", "stale-if-error"].includes(directive)
      )
      .map(([directive, value]) => {
        const dirValue =
          directive === "max-age"
            ? (maxAgeValue ?? 0) + Math.max(swrValue ?? 0, sieValue ?? 0)
            : value;
        return [directive, dirValue].filter(Boolean).join("=");
      })
      .join(", "),
    ...(swrValue === undefined
      ? {}
      : {
          "x-workers-swr-metadata-stale-while-revalidate": `${swrValue}`,
        }),
    ...(sieValue === undefined
      ? {}
      : {
          "x-workers-swr-metadata-stale-if-error": `${sieValue}`,
        }),
  };
}

/**
 * Generates headers to apply to the response before sending it to the user, this basically
 * reverts the modifications applied generateHeadersForWorkersCache
 * (so that the response is sent to the user as it was originally)
 *
 * @param responseHeaders headers from the response (from the workers cache)
 * @returns headers to apply/override to the response before sending it to the user
 */
export function generateUserHeadersFromWorkersCache(
  responseHeaders: Headers
): Record<string, string> {
  const result: Record<string, string> = {};

  let swrValue: number | undefined;
  let sieValue: number | undefined;

  responseHeaders.forEach((value, key) => {
    if (key === "x-workers-swr-metadata-stale-while-revalidate") {
      swrValue = parseInt(value);
      return;
    }

    if (key === "x-workers-swr-metadata-stale-if-error") {
      sieValue = parseInt(value);
      return;
    }

    result[key] = value;
  });

  const cacheControl = result["cache-control"];
  if (cacheControl) {
    result["cache-control"] = cacheControl?.replace(
      /max-age=(\d+)/,
      (_, maxAgeStr) => {
        const maxAgeValue = parseInt(maxAgeStr);
        return [
          `max-age=${maxAgeValue - Math.max(swrValue ?? 0, sieValue ?? 0)}`,
          swrValue && `stale-while-revalidate=${swrValue}`,
          sieValue && `stale-if-error=${sieValue}`,
        ]
          .filter(Boolean)
          .join(", ");
      }
    );
  }

  return result;
}

type WorkersSwrMetadataHeaders = `x-workers-swr-metadata-${
  | "stale-while-revalidate"
  | "stale-if-error"}`;

type HeadersForWorkersCache = {
  "Cache-Control": string;
} & {
  [Key in WorkersSwrMetadataHeaders]?: string;
};

function collectDirectivesAndValues(
  cacheControl: string
): Record<string, string | undefined> {
  return cacheControl
    .split(",")
    .map((directive) => directive.trim())
    .reduce((directives, directive) => {
      const parts = directive.split("=").map((part) => part.trim());
      return {
        ...directives,
        [parts[0]!.toLowerCase()]: parts[1],
      };
    }, {});
}

function getNumberValue(
  directivesAndValues: Record<string, string | undefined>,
  directiveName: string
): number | undefined {
  const number = parseInt(directivesAndValues[directiveName] ?? "");
  return isNaN(number) ? undefined : number;
}
