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
    const blocks = await this.db.Block.findAll({
      include: this.db.Transaction,
      limit: cacheLimit,
    });

    blocks.forEach((block) => {
      this.sharedCache.add(block.number, block);
    });
  }

  async createReport(startBlock, endBlock) {
    const data = await this.reporter.createReport(startBlock, endBlock);
    const addresses = [];

    const addressData = {
      address: "",
      sent: 0,
      received: 0,
      isContract: false,
    };

    const summary = {
      totalSent: 0,
      totalUncles: 0,
    };

    data.forEach((block) => {
      summary.totalUncles += block.uncles;

      block.transactions.forEach((tx) => {
        summary.totalSent += tx.value;

        if (addresses[tx.to] === undefined) {
          addresses[tx.to] = {
            ...addressData,
            address: tx.to,
            received: tx.value,
            isContract: tx.input.length > 2,
          };
        } else {
          addresses[tx.to].received += tx.value;
        }

        if (addresses[tx.from] === undefined) {
          addresses[tx.from] = {
            ...addressData,
            address: tx.from,
            sent: tx.value,
          };
        } else {
          addresses[tx.from].sent += tx.value;
        }

        console.log(addresses);
      });
    });
  }

  async loadLastNBlocks(count) {
    await this.infura.loadLastNBlocks(count);
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
