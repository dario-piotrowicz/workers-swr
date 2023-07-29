import { describe, expect, it } from "vitest";
import { processCacheControlForWorkersCache } from '../src/cacheControl';

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
      "private, max-age=30, vary=accept-language"
    ].forEach(cacheControl => {
      const result = processCacheControlForWorkersCache(cacheControl);
      expect(result).toEqual({
        'Cache-Control': cacheControl
      });
    })
  });
});
