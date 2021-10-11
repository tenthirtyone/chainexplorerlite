require("dotenv").config();
const API = require("./lib/api");
const DB = require("./lib/db");
const Infura = require("./lib/infura");
const Reporter = require("./lib/reporter");
const { sharedCache } = require("./lib/cache");
const Logger = require("./lib/logger");

class Explorer {
  constructor(config) {
    this.logger = new Logger("App");
    this.config = { ...Explorer.DEFAULTS, ...config };
    this.api = new API();
    this.api.express.set("explorer", this);
    this.infura = new Infura();
    this.db = new DB();
    this.reporter = new Reporter();
    this.sharedCache = sharedCache;
  }

  start() {
    this.logger.info("App starting...");
    this.populateCache();
    this.api.start();
    this.infura.start();
    this.logger.info("App started.");
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
        this.sharedCache.add(block.number, block);
      });
      this.infura.highestBlock = blocks[blocks.length - 1].number;
    } catch (e) {
      this.logger.error(
        "Error Populating Cache - if this is the first run/no blocks table it is safe to ignore this"
      );
    }
  }

  async createReport(startBlock, endBlock) {
    const report = await this.reporter.createReport(
      startBlock,
      endBlock === "null" ||
        endBlock === undefined ||
        endBlock === null ||
        !endBlock
        ? this.infura.highestBlock
        : endBlock
    );

    return report;
  }

  async fetchLastNBlocks(count) {
    await this.infura.fetchLastNBlocks(count);
  }

  static get DEFAULTS() {
    return {
      cacheLimit: 1e10,
    };
  }
}

if (require.main === module) {
  const explorer = new Explorer();
  explorer.start();
} else {
  module.exports = Explorer;
}
