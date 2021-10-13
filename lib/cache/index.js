const LRU = require("lru-cache");
const DB = require("../db");
const Logger = require("../logger");
const { oneDay } = require("../util/constants");

class Cache {
  /**
   * Block objects are stored with their transactions in a
   * a shared cache. Intended to simulate Redis or comparable
   * cache service.
   * @param  {Object} config
   */
  constructor(config) {
    this.config = { ...Cache.DEFAULTS, ...config };
    this.logger = new Logger(this.config.name);
    this.lru = new LRU(this.config.lru);
    this.db = new DB({ name: this.config.name });
    this.highestBlock = -1;
  }

  /**
   * Adds val to the cache at key
   * @param  {Integer} key
   * @param  {Object} val
   */
  add(key, val) {
    if (this.highestBlock < key) {
      this.highestBlock = key;
    }

    this.lru.set(key, val);
  }

  /**
   * Returns the stored value at key
   * @param  {Integer} key
   */
  get(key) {
    return this.lru.get(key);
  }

  /**
   * Removes key from cache, sharedCache will never delete
   * otherwise highestBlock may need to be checked/replaced.
   * @param  {Integer} key
   */
  delete(key) {
    this.lru.del(key);
  }

  /**
   * Checks for an object at key
   * @param  {Integer} key
   */
  exists(key) {
    return this.lru.has(key);
  }

  /**
   * On startup, load stored block data into the cache
   */
  async populateCache() {
    this.logger.info(`Adding historical blocks to cache-${this.config.name}`);
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
    this.logger.info(
      `Finished caching historical blocks to cache-${this.config.name}`
    );
  }

  static get DEFAULTS() {
    return {
      name: "Cache",
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

const sharedCache = new Cache({ name: "Shared Cache" });

module.exports = {
  sharedCache, // Singleton
  Cache,
};
