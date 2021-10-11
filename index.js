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
    //this.infura.start();
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

    const senders = [];
    const receivers = [];
    const contracts = [];

    let summary = {
      totalSent: 0,
      totalUncles: 0,
      uniqueSenders: 0,
      uniqueReceivers: 0,
      contractsCreated: 0,
      uniqueAddresses: 0,
    };

    data.forEach((block) => {
      summary.totalUncles += block.uncles;

      block.transactions.forEach((tx) => {
        summary.totalSent += tx.value;

        // Null addr = contract created (0x000...)
        if (tx.to === null) {
          summary.contractsCreated++;
        } else {
          senders[tx.to] === undefined
            ? (senders[tx.to] = tx.value)
            : (senders[tx.to] += tx.value);
        }

        receivers[tx.from] === undefined
          ? (receivers[tx.from] = tx.value)
          : (receivers[tx.from] += tx.value);

        // 0x by default, contract call data check
        if (tx.input.length > 2) {
          contracts.push(tx.to);
        }

        // unique addrs
        addresses[tx.to] = true;
        addresses[tx.from] = true;
      });
    });

    summary.uniqueSenders = Object.keys(senders).length;
    summary.uniqueReceivers = Object.keys(receivers).length;
    summary.uniqueAddresses = Object.keys(addresses).length;

    return {
      summary,
      senders,
      receivers,
      contracts,
    };
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
