require("dotenv").config();
const API = require("./lib/api");
const DB = require("./lib/db");
const Reporter = require("./lib/reporter");
const { sharedCache } = require("./lib/cache");
const Logger = require("./lib/logger");

class Explorer {
  constructor(config) {
    this.logger = new Logger("App");
    this.config = { ...Explorer.DEFAULTS, ...config };
    this.api = new API();
    this.db = new DB();
    this.reporter = new Reporter();
  }

  start() {
    this.logger.info("App starting...");
    // Start DB
    this.api.start();
    this.logger.info("App started.");
  }

  async populateCache() {
    const { cacheLimit } = this.config;
    const blocks = await this.db.Block.findAll({ limit: cacheLimit });
    console.log(blocks);
    // add each block to the sharedCache
  }

  async createReport(startBlock, endBlock) {
    let report = this.reporter.createReport(startBlock, endBlock);
    console.log(report);
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
