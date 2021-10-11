const LRU = require("lru-cache");
const DB = require("../db");
const { oneDay } = require("../util/constants");

class Cache {
  constructor(config) {
    this.config = { ...Cache.DEFAULTS, ...config };
    this.lru = new LRU(this.config.lru);
    this.db = new DB();
    this.highestBlock = -1;
  }

  add(key, val) {
    if (this.highestBlock < key) {
      this.highestBlock = key;
    }

    this.lru.set(key, val);
  }

  get(key) {
    return this.lru.get(key);
  }

  // only temp caches delete, otherwise highestBlock
  // would require tracking/updating
  delete(key) {
    this.lru.del(key);
  }

  exists(key) {
    return this.lru.has(key);
  }

  async populateCache() {
    const { cacheLimit } = this.config;
    let blocks = [];

    try {
      blocks = await this.db.Block.findAll({
        include: this.db.Transaction,
        limit: cacheLimit,
      });

      blocks.forEach((block) => {
        this.add(block.number, block);
      });
    } catch (e) {
      this.logger.error(
        "Error Populating Cache - if this is the first run/no blocks table it is safe to ignore this"
      );
    }
  }

  static get DEFAULTS() {
    return {
      cacheLimit: 1e10,
      lru: {
        max: 1e6,
        dispose: function (key, n) {
          n = "";
        },
        maxAge: oneDay,
      },
    };
  }
}

const sharedCache = new Cache();
sharedCache.populateCache();

module.exports = {
  sharedCache, // Singleton
  Cache,
};
