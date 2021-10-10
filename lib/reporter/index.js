const { sharedCache } = require("../cache");
const { oneSecond } = require("../util/constants");
const Logger = require("../logger");
const DB = require("../db");
const Infura = require("../infura");

/*

a report can be ready - all blocks in cache
indexing - infura is pulling the data

reports get an id. If indexing, it returns the status and % complete
if ready it returns the report

*/

class Reporter {
  constructor(config) {
    this.logger = new Logger("Reporter");
    this.config = { ...config };
    this.sharedCache = sharedCache;
    this.db = new DB();
    this.infura = new Infura();
    this.queue = [];
    this.eventLoop = null;
    this.reportStatusCodes = Object.freeze({
      1: "started", // Report has been requested
      2: "queue", // Report data is in infura service
      3: "pending", // Report data is fetched, waiting to complete it
      4: "complete", // Report is ready for the user
    });
  }

  start() {
    const { eventLoopTimer } = this.config;

    this.web3 = new Web3(
      new Web3.providers.WebsocketProvider(
        `wss://mainnet.infura.io/ws/v3/${this.config.projectId}`
      )
    );

    this.eventLoop = setInterval(async () => {
      if (this.queue.length > 0) {
        const job = this.queue.shift();
        this.logger.info(`${job.op}-${job.params}`);
        console.log(job);
      }
    }, eventLoopTimer);
  }

  stop() {
    clearInterval(this.eventLoop);
  }

  createReportId() {
    return Math.round(Math.random() * 1e18);
  }

  async createReport(startBlock, endBlock) {
    if (!endBlock) {
      endBlock = await this.db.getLatestBlockNumber();
    }

    if (startBlock > endBlock) {
      throw new Error("endblock is after startblock");
    }

    const report = this.db.Report.build({
      id: this.createReportId(),
      startBlock,
      endBlock,
      status: this.reportStatusCodes[1],
    });

    console.log(report);

    if (this.cacheHasBlockData(startBlock, endBlock)) {
      this.logger.info(`Creating report...`);
      // Set status to pending
      Report.status = this.reportStatusCodes[2];
      this.addBlocksToReport(report, startBlock, endBlock);

      // Create the report
      // Set status to complete
    } else {
      Report.status = this.reportStatusCodes[3];
      this.logger.info(`Caching block data ${startBlock} - ${endBlock}`);
      this.getBlocksFromInfura(startBlock, endBlock);
    }
  }

  cacheHasBlockData(startBlock, endBlock) {
    let current = startBlock;
    while (current <= endBlock) {
      if (!this.sharedCache.exists(current)) {
        this.logger("Blocks NOT found in cache");
        return false;
      }
    }

    this.logger("Blocks found in cache");
    return true;
  }

  addBlocksToReport(report, startBlock, endBlock) {
    this.logger.info("Adding blocks to report: " + report.reportId);

    let current = startBlock;
    while (startBlock <= endBlock) {}

    report.status = this.reportStatusCodes[4];
  }

  static get DEFAULTS() {
    return {
      eventLoopTimer: oneSecond * 5,
    };
  }
}

module.exports = Reporter;
