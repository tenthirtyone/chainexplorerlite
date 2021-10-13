const expect = require("expect");
const { Cache } = require("../lib/cache");
const cache1 = require("../lib/cache").sharedCache;
const cache2 = require("../lib/cache").sharedCache;

describe("Cache", () => {
  process.env.DATABASE_NAME = "test";
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
  it("has a singleton pattern for sharing across the app", () => {
    cache1.add(0, 1234);

    expect(cache2.exists(0)).toBe(true);
  });
  it("tracks the highest block number in the cache", () => {
    const reallyBigNumber = 1e18;
    cache.add(reallyBigNumber, true);
    cache.add(0, true);
    cache.add(1, true);
    cache.add(2, true);

    expect(cache.highestBlock).toBe(reallyBigNumber);
  });
});
