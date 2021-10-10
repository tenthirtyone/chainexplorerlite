const expect = require("expect");
const { Cache } = require("../lib/cache");
const cache1 = require("../lib/cache").sharedCache;
const cache2 = require("../lib/cache").sharedCache;

describe("Cache", () => {
  let cache;
  let testKey = "test";
  let testValue = 100;

  beforeEach(() => {
    cache = new Cache();
  });

  it("adds an item to the cache", () => {
    cache.add(testKey, testValue);

    expect(cache.exists(testKey)).toBe(true);
  });
  it("retrieves an item from the cache", () => {
    cache.add(testKey, testValue);

    expect(cache.get(testKey)).toBe(testValue);
  });
  it("stale items are removed from the cache", () => {
    cache = new Cache({ maxAge: 1 });

    cache.add(testKey, testValue);
    setTimeout(() => {
      expect(cache.exists(testKey)).toBe(false);
    }, 2);
  });
  it("rotates the oldest item out of the cache", () => {
    cache = new Cache({ max: 1 });
    cache.add(0, 0);
    cache.add(1, 1);

    expect(cache.exists(0)).toBe(false);
    expect(cache.exists(1)).toBe(true);
  });
  it("has a singleton pattern for sharing across the app", () => {
    cache1.add(0, 1234);

    expect(cache2.exists(0)).toBe(true);
  });
});
