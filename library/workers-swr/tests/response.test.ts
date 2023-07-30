import { describe, expect, it } from "vitest";
import { getResponseCachingChecks } from '../src/response';

describe("getResponseCachingChecks", () => {
  it("should return all checks to false if the response is not cached (/not provided)", () => {
    expect(getResponseCachingChecks(undefined)).toEqual({
      "isCached": false,
      "isFresh": false,
      "shouldBeRevalidated": false,
      "shouldOverrideError": false,
    });
  });

  it("should correctly detect a fresh response", () => {
    const response = new Response('', {
      headers: {
        age: '5',
        'cache-control': 'max-age=10'
      }
    });
    expect(getResponseCachingChecks(response)).toEqual({
      "isCached": true,
      "isFresh": true,
      "shouldBeRevalidated": false,
      "shouldOverrideError": false,
    });
  });

  it("should correctly detect a response that needs revalidation", () => {
    const response = new Response('', {
      headers: {
        age: '9',
        'cache-control': 'max-age=10',
        "x-workers-swr-metadata-stale-while-revalidate": "6",
      }
    });
    expect(getResponseCachingChecks(response)).toEqual({
      "isCached": true,
      "isFresh": false,
      "shouldBeRevalidated": true,
      "shouldOverrideError": false,
    });
  });

  it("should correctly detect a response that can be returned instead of an error", () => {
    const response = new Response('', {
      headers: {
        age: '7',
        'cache-control': 'max-age=8',
        "x-workers-swr-metadata-stale-if-error": "3",
      }
    });
    expect(getResponseCachingChecks(response)).toEqual({
      "isCached": true,
      "isFresh": false,
      "shouldBeRevalidated": false,
      "shouldOverrideError": true,
    });
  });
});
