require("dotenv").config();
const API = require("./lib/api");

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

    this.reporter = new Reporter();
    this.sharedCache = sharedCache;
  }

  start() {
    this.logger.info("App starting...");

    this.api.start();
    this.infura.start();
    this.logger.info("App started.");
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
    return {};
  }
}

if (require.main === module) {
  const explorer = new Explorer();
  explorer.start();
} else {
  module.exports = Explorer;
}
