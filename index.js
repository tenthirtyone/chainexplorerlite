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
    const blocks = await this.db.Block.findAll({ limit: cacheLimit });

    blocks.forEach((block) => {
      this.sharedCache.add(block.number, block);
    });
  }

  async createReport(startBlock, endBlock) {
    let report = this.reporter.createReport(startBlock, endBlock);
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
