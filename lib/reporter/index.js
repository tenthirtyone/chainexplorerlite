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
    const data = await this.getReportData(startBlock, endBlock);
    return data;
  }

  async getReportData(startBlock, endBlock) {
    if (startBlock > endBlock) {
      throw new Error("endblock is after startblock");
    }

    const report = [];

    let current = startBlock;
    while (current <= endBlock) {
      const block = await this.sharedCache.get(current);
      report.push(block);
      current++;
    }

    return report;
  }

  static get DEFAULTS() {
    return {};
  }
}

module.exports = Reporter;
