const { sharedCache } = require("../cache");
const { oneSecond } = require("../util/constants");
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
    if (startBlock > endBlock) {
      throw new Error("endblock is after startblock");
    }

    const report = this.db.Report.build({
      id: this.createReportId(),
      startBlock,
      endBlock,
    });

    let current = startBlock;
    while (current <= endBlock) {
      const block = await this.sharedCache.get(current);
      console.log(block);
      report.addBlock(block);
      current++;
    }

    console.log(report);

    await report.save();
    return report;
  }

  static get DEFAULTS() {
    return {};
  }
}

module.exports = Reporter;
