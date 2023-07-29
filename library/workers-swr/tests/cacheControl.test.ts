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
});
