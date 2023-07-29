import { describe, expect, it } from "vitest";
import { processCacheControlForWorkersCache } from "../src/cacheControl";

describe("processCacheControlForWorkersCache", () => {
  it("should return null if no Cache-Control header is provided", () => {
    const result = processCacheControlForWorkersCache(null);
    expect(result).toEqual(null);
  });

  it("should return null if an empty Cache-Control header is provided", () => {
    const result = processCacheControlForWorkersCache("");
    expect(result).toEqual(null);
  });

  it("should return the Cache-Control header untouched if no swr/sie directives are provided", () => {
    [
      "no-store",
      "no-cache",
      "max-age=1",
      "private, max-age=600",
      "public, max-age=31536000",
      "max-age=1800, must-revalidate",
      "private, max-age=30, vary=accept-language",
    ].forEach((cacheControl) => {
      const result = processCacheControlForWorkersCache(cacheControl);
      expect(result).toEqual({
        "Cache-Control": cacheControl,
      });
    });
  });

  it("should handle a Cache-Control with a zero stale-while-revalidate directive", () => {
    const result = processCacheControlForWorkersCache(
      "max-age=5, stale-while-revalidate=0"
    );
    expect(result).toEqual({
      "Cache-Control": "max-age=5",
      "x-workers-swr-metadata-stale-while-revalidate": "0",
    });
  });

  it("should handle a Cache-Control with a non zero stale-while-revalidate directive", () => {
    const result = processCacheControlForWorkersCache(
      "max-age=5, stale-while-revalidate=5"
    );
    expect(result).toEqual({
      "Cache-Control": "max-age=10",
      "x-workers-swr-metadata-stale-while-revalidate": "5",
    });
  });

  it("should handle a Cache-Control with a non zero stale-while-revalidate directive present as the first directive", () => {
    const result = processCacheControlForWorkersCache(
      "stale-while-revalidate=2, immutable, max-age=3"
    );
    expect(result).toEqual({
      "Cache-Control": "immutable, max-age=5",
      "x-workers-swr-metadata-stale-while-revalidate": "2",
    });
  });

  it("should handle a Cache-Control with a non zero stale-while-revalidate directive followed by a different directive", () => {
    const result = processCacheControlForWorkersCache(
      "max-age=1, stale-while-revalidate=2, public"
    );
    expect(result).toEqual({
      "Cache-Control": "max-age=3, public",
      "x-workers-swr-metadata-stale-while-revalidate": "2",
    });
  });

  it("should handle a Cache-Control with a zero stale-if-error directive", () => {
    const result = processCacheControlForWorkersCache(
      "max-age=5, stale-if-error=0"
    );
    expect(result).toEqual({
      "Cache-Control": "max-age=5",
      "x-workers-swr-metadata-stale-if-error": "0",
    });
  });

  it("should handle a Cache-Control with a non zero stale-if-error directive", () => {
    const result = processCacheControlForWorkersCache(
      "max-age=5, stale-if-error=5"
    );
    expect(result).toEqual({
      "Cache-Control": "max-age=10",
      "x-workers-swr-metadata-stale-if-error": "5",
    });
  });

  it("should handle a Cache-Control with a non zero stale-if-error directive present as the first directive", () => {
    const result = processCacheControlForWorkersCache(
      "stale-if-error=2, immutable, max-age=3"
    );
    expect(result).toEqual({
      "Cache-Control": "immutable, max-age=5",
      "x-workers-swr-metadata-stale-if-error": "2",
    });
  });

  it("should handle a Cache-Control with a non zero stale-if-error directive followed by a different directive", () => {
    const result = processCacheControlForWorkersCache(
      "max-age=1, stale-if-error=2, public"
    );
    expect(result).toEqual({
      "Cache-Control": "max-age=3, public",
      "x-workers-swr-metadata-stale-if-error": "2",
    });
  });
});
