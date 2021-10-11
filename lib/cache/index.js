const LRU = require("lru-cache");
const { oneDay } = require("../util/constants");

class Cache {
  constructor(config) {
    this.lru = new LRU({ ...Cache.DEFAULTS, ...config });
  }

  add(key, val) {
    this.lru.set(key, val);
  }

  get(key) {
    return this.lru.get(key);
  }

  delete(key) {
    this.lru.del(key);
  }

  exists(key) {
    return this.lru.has(key);
  }

  static get DEFAULTS() {
    return {
      max: 1e6,
      dispose: function (key, n) {
        n = "";
      },
      maxAge: oneDay,
    };
  }
}

const sharedCache = new Cache();

module.exports = {
  sharedCache, // Singleton
  Cache,
};
