const { sharedCache } = require("../cache");
const Logger = require("../logger");
const DB = require("../db");

class Reporter {
  constructor(config) {
    this.logger = new Logger("Reporter");
    this.config = { ...config };
    this.sharedCache = sharedCache;
    this.db = new DB();
  }

  createReportId() {
    return Math.round(Math.random() * 1e18);
  }

  async createReport(startBlock, endBlock) {
    let data = [];
    try {
      data = await this.getReportData(startBlock, endBlock);
    } catch (e) {
      this.logger.error(e);
    }
    return this.parseReportData(data);
  }

  parseReportData(data) {
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

      block.transactions?.forEach((tx) => {
        summary.totalSent += parseInt(tx.value);

        // Null addr = contract created (0x000...)
        if (tx.to === null) {
          summary.contractsCreated++;
        } else {
          senders[tx.to] === undefined
            ? (senders[tx.to] = parseInt(tx.value))
            : (senders[tx.to] += parseInt(tx.value));
        }

        receivers[tx.from] === undefined
          ? (receivers[tx.from] = parseInt(tx.value))
          : (receivers[tx.from] += parseInt(tx.value));

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

  async getReportData(startBlock, endBlock) {
    console.log(startBlock);
    console.log(endBlock);
    if (startBlock > endBlock) {
      throw new Error("endblock is before startblock");
    }

    const data = [];

    let current = startBlock;
    while (current <= endBlock) {
      const block = await this.sharedCache.get(current);
      data.push(block);
      current++;
    }

    return data;
  }

  static get DEFAULTS() {
    return {};
  }
}

module.exports = Reporter;
