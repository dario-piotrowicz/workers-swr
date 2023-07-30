import { describe, expect, it } from "vitest";
import {
  extractCachingValues,
  generateHeadersForWorkersCache,
  generateUserHeadersFromWorkersCache,
} from "../src/headers";

describe("generateHeadersForWorkersCache", () => {
  it("should return null if no Cache-Control header is provided", () => {
    const result = generateHeadersForWorkersCache(null);
    expect(result).toEqual(null);
  });

  it("should return null if an empty Cache-Control header is provided", () => {
    const result = generateHeadersForWorkersCache("");
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
      const result = generateHeadersForWorkersCache(cacheControl);
      expect(result).toEqual({
        "Cache-Control": cacheControl,
      });
    });
  });

  describe("stale-while-revalidate", () => {
    it("should handle a zero stale-while-revalidate directive", () => {
      const result = generateHeadersForWorkersCache(
        "max-age=5, stale-while-revalidate=0"
      );
      expect(result).toEqual({
        "Cache-Control": "max-age=5",
        "x-workers-swr-metadata-stale-while-revalidate": "0",
      });
    });

    it("should handle a non zero stale-while-revalidate directive", () => {
      const result = generateHeadersForWorkersCache(
        "max-age=5, stale-while-revalidate=5"
      );
      expect(result).toEqual({
        "Cache-Control": "max-age=10",
        "x-workers-swr-metadata-stale-while-revalidate": "5",
      });
    });

    it("should handle a non zero stale-while-revalidate directive present as the first directive", () => {
      const result = generateHeadersForWorkersCache(
        "stale-while-revalidate=2, immutable, max-age=3"
      );
      expect(result).toEqual({
        "Cache-Control": "immutable, max-age=5",
        "x-workers-swr-metadata-stale-while-revalidate": "2",
      });
    });

    it("should handle a non zero stale-while-revalidate directive followed by a different directive", () => {
      const result = generateHeadersForWorkersCache(
        "max-age=1, stale-while-revalidate=2, public"
      );
      expect(result).toEqual({
        "Cache-Control": "max-age=3, public",
        "x-workers-swr-metadata-stale-while-revalidate": "2",
      });
    });
  });

  describe("stale-if-error", () => {
    it("should handle a zero stale-if-error directive", () => {
      const result = generateHeadersForWorkersCache(
        "max-age=5, stale-if-error=0"
      );
      expect(result).toEqual({
        "Cache-Control": "max-age=5",
        "x-workers-swr-metadata-stale-if-error": "0",
      });
    });

    it("should handle a non zero stale-if-error directive", () => {
      const result = generateHeadersForWorkersCache(
        "max-age=5, stale-if-error=5"
      );
      expect(result).toEqual({
        "Cache-Control": "max-age=10",
        "x-workers-swr-metadata-stale-if-error": "5",
      });
    });

    it("should handle a non zero stale-if-error directive present as the first directive", () => {
      const result = generateHeadersForWorkersCache(
        "stale-if-error=2, immutable, max-age=3"
      );
      expect(result).toEqual({
        "Cache-Control": "immutable, max-age=5",
        "x-workers-swr-metadata-stale-if-error": "2",
      });
    });

    it("should handle a non zero stale-if-error directive followed by a different directive", () => {
      const result = generateHeadersForWorkersCache(
        "max-age=1, stale-if-error=2, public"
      );
      expect(result).toEqual({
        "Cache-Control": "max-age=3, public",
        "x-workers-swr-metadata-stale-if-error": "2",
      });
    });
  });

  describe("stale-while-revalidate + stale-if-error", () => {
    it("should handle a zero stale-while-revalidate directive and a zero stale-if-error directive", () => {
      const result = generateHeadersForWorkersCache(
        "max-age=5, stale-while-revalidate=0, stale-if-error=0"
      );
      expect(result).toEqual({
        "Cache-Control": "max-age=5",
        "x-workers-swr-metadata-stale-while-revalidate": "0",
        "x-workers-swr-metadata-stale-if-error": "0",
      });
    });

    it("should handle a non zero stale-while-revalidate directive and a zero stale-if-error directive", () => {
      const result = generateHeadersForWorkersCache(
        "max-age=5, stale-while-revalidate=5, stale-if-error=0"
      );
      expect(result).toEqual({
        "Cache-Control": "max-age=10",
        "x-workers-swr-metadata-stale-while-revalidate": "5",
        "x-workers-swr-metadata-stale-if-error": "0",
      });
    });

    it("should handle a zero stale-while-revalidate directive and a non zero stale-if-error directive", () => {
      const result = generateHeadersForWorkersCache(
        "max-age=5, stale-while-revalidate=0, stale-if-error=5"
      );
      expect(result).toEqual({
        "Cache-Control": "max-age=10",
        "x-workers-swr-metadata-stale-while-revalidate": "0",
        "x-workers-swr-metadata-stale-if-error": "5",
      });
    });

    it("should handle a non zero stale-while-revalidate directive and a non zero stale-if-error directive", () => {
      const result = generateHeadersForWorkersCache(
        "max-age=5, stale-while-revalidate=5, stale-if-error=5"
      );
      expect(result).toEqual({
        "Cache-Control": "max-age=10",
        "x-workers-swr-metadata-stale-while-revalidate": "5",
        "x-workers-swr-metadata-stale-if-error": "5",
      });
    });

    it("should pick the use the stale-while-revalidate directive value over a smaller stale-if-error directive value", () => {
      const result = generateHeadersForWorkersCache(
        "max-age=10, stale-while-revalidate=50, stale-if-error=33"
      );
      expect(result).toEqual({
        "Cache-Control": "max-age=60",
        "x-workers-swr-metadata-stale-while-revalidate": "50",
        "x-workers-swr-metadata-stale-if-error": "33",
      });
    });

    it("should pick the use the stale-if-error directive value over a smaller stale-while-revalidate directive value", () => {
      const result = generateHeadersForWorkersCache(
        "max-age=5, stale-while-revalidate=13, stale-if-error=15"
      );
      expect(result).toEqual({
        "Cache-Control": "max-age=20",
        "x-workers-swr-metadata-stale-while-revalidate": "13",
        "x-workers-swr-metadata-stale-if-error": "15",
      });
    });
  });
});

describe("generateUserHeadersFromWorkersCache", () => {
  it("should return an empty object no headers are provided", () => {
    const result = generateUserHeadersFromWorkersCache(new Headers());
    expect(result).toEqual({});
  });

  it("should return the same headers untouched if no swr/sie directives were provided", () => {
    const result = generateUserHeadersFromWorkersCache(
      new Headers({
        "Cache-Control": "max-age=1",
        "my-header": "My Header Value",
      })
    );
    expect(result).toEqual({
      "cache-control": "max-age=1",
      "my-header": "My Header Value",
    });
  });

  it("should adjust the headers when a x-workers-swr-metadata-stale-while-revalidate header is provided", () => {
    const result = generateUserHeadersFromWorkersCache(
      new Headers({
        "Cache-Control": "max-age=20",
        "x-workers-swr-metadata-stale-while-revalidate": "15",
      })
    );
    expect(result).toEqual({
      "cache-control": "max-age=5, stale-while-revalidate=15",
    });
  });

  it("should adjust the headers when a x-workers-swr-metadata-stale-if-error header is provided", () => {
    const result = generateUserHeadersFromWorkersCache(
      new Headers({
        "Cache-Control": "max-age=20",
        "x-workers-swr-metadata-stale-if-error": "15",
      })
    );
    expect(result).toEqual({
      "cache-control": "max-age=5, stale-if-error=15",
    });
  });

  it("should adjust the headers when both x-workers-swr-metadata-stale-while-revalidate and x-workers-swr-metadata-stale-if-error headers are provided and swr > sie", () => {
    const result = generateUserHeadersFromWorkersCache(
      new Headers({
        "Cache-Control": "max-age=105",
        "x-workers-swr-metadata-stale-while-revalidate": "90",
        "x-workers-swr-metadata-stale-if-error": "66",
      })
    );
    expect(result).toEqual({
      "cache-control":
        "max-age=15, stale-while-revalidate=90, stale-if-error=66",
    });
  });

  it("should adjust the headers when both x-workers-swr-metadata-stale-while-revalidate and x-workers-swr-metadata-stale-if-error headers are provided and sie > swr", () => {
    const result = generateUserHeadersFromWorkersCache(
      new Headers({
        "Cache-Control": "max-age=80",
        "x-workers-swr-metadata-stale-while-revalidate": "25",
        "x-workers-swr-metadata-stale-if-error": "55",
      })
    );
    expect(result).toEqual({
      "cache-control":
        "max-age=25, stale-while-revalidate=25, stale-if-error=55",
    });
  });
});

describe("extractCachingValues", () => {
  it("should return null if the response doesn't have any headers", () => {
    const result = extractCachingValues(new Response());
    expect(result).toBe(null);
  });

  it("should return null if the response doesn't have an age header", () => {
    const result = extractCachingValues(
      new Response("", {
        headers: {
          "Cache-Control": "max-age=1",
          "x-workers-swr-metadata-stale-while-revalidate": "2",
          "x-workers-swr-metadata-stale-if-error": "3",
        },
      })
    );
    expect(result).toBe(null);
  });

  it("should return null if the response doesn't have a max-age cache control directive", () => {
    const result = extractCachingValues(
      new Response("", {
        headers: {
          age: "4",
          "Cache-Control": "public",
          "x-workers-swr-metadata-stale-while-revalidate": "2",
          "x-workers-swr-metadata-stale-if-error": "3",
        },
      })
    );
    expect(result).toBe(null);
  });

  it("should return the age and max-age caching values", () => {
    const result = extractCachingValues(
      new Response("", {
        headers: {
          age: "4",
          "Cache-Control": "max-age=5",
        },
      })
    );
    expect(result).toEqual({
      age: 4,
      maxAge: 5,
    });
  });

  it("should return the age, (the real) max-age and swr caching values", () => {
    const result = extractCachingValues(
      new Response("", {
        headers: {
          age: "4",
          "Cache-Control": "max-age=3",
          "x-workers-swr-metadata-stale-while-revalidate": "2",
        },
      })
    );
    expect(result).toEqual({
      age: 4,
      maxAge: 1,
      swr: 2,
    });
  });

  it("should return the age, (the real) max-age and sie caching values", () => {
    const result = extractCachingValues(
      new Response("", {
        headers: {
          age: "4",
          "Cache-Control": "max-age=3",
          "x-workers-swr-metadata-stale-if-error": "2",
        },
      })
    );
    expect(result).toEqual({
      age: 4,
      maxAge: 1,
      sie: 2,
    });
  });

  it("should return the age, (the real) max-age, swr and sie caching values", () => {
    const result = extractCachingValues(
      new Response("", {
        headers: {
          age: "4",
          "Cache-Control": "max-age=3",
          "x-workers-swr-metadata-stale-while-revalidate": "1",
          "x-workers-swr-metadata-stale-if-error": "2",
        },
      })
    );
    expect(result).toEqual({
      age: 4,
      maxAge: 1,
      swr: 1,
      sie: 2,
    });
  });
});
