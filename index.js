require("dotenv").config();
const API = require("./lib/api");
const Reporter = require("./lib/reporter");
const { sharedCache } = require("./lib/cache");
const Logger = require("./lib/logger");

class Explorer {
  /**
   * High-level aggregator of the applications
   * sub modules. Allows for importing as a module or
   * running from the command line.
   *
   * Launches the API and Block Service on start and
   * interfaces directly with the reporting service.
   * @param  {Object} config
   */
  constructor(config) {
    this.logger = new Logger("App");
    this.config = { ...Explorer.DEFAULTS, ...config };
    this.api = new API();
    this.api.express.set("explorer", this);
    this.reporter = new Reporter();
    this.sharedCache = sharedCache;
  }
  /**
   * Let's <a href="https://www.urbandictionary.com/define.php?term=Kick%20this%20pig">kick this pig!</a>
   */
  start() {
    this.logger.info("App starting...");
    this.api.start();
    this.sharedCache.populateCache();
    this.reporter.start();
    this.logger.info("App started.");
  }

  stop() {
    this.api.stop();
    this.reporter.stop();
  }
  /**
   * Creates a report with the inclusive range startBlock - endBlock
   * @param  {Integer} startBlock
   * @param  {Integer} endBlock
   */
  async createRangeReport(startBlock, endBlock) {
    return await this.reporter.createRangeReport(startBlock, endBlock);
  }

  /**
   * Creates a report starting at the highest block height and
   * going back lastNBlocks in time
   * @param  {Integer} lastNBlocks
   */
  async createLastNReport(lastNBlocks) {
    return await this.reporter.createLastNReport(lastNBlocks);
  }
  /**
   * Queues historic block data requests in the infura block service
   * @param  {Integer} startBlock
   * @param  {Integer} endBlock
   */
  fetchHistoricalBlockData(startBlock, endBlock) {
    this.reporter.infura.fetchHistoricalBlockData(startBlock, endBlock);
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
