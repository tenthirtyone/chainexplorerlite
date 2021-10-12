require("dotenv").config();
const API = require("./lib/api");
const Infura = require("./lib/infura");
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
    this.infura = new Infura();

    this.reporter = new Reporter();
    this.sharedCache = sharedCache;
  }
  /**
   * Let's <a href="https://www.urbandictionary.com/define.php?term=Kick%20this%20pig">kick this pig!</a>
   */
  start() {
    this.logger.info("App starting...");
    this.api.start();
    this.infura.start();
    this.logger.info("App started.");
  }
  /**
   * Creates a report with the inclusive range startBlock - endBlock
   * @param  {Integer} startBlock
   * @param  {Integer} endBlock
   */
  async createReport(startBlock, endBlock) {
    const report = await this.reporter.createReport(
      !parseInt(startBlock) ? this.sharedCache.highestBlock : startBlock,
      !parseInt(endBlock) ? this.sharedCache.highestBlock : endBlock
    );

    return report;
  }

  /**
   * Creates a report starting at the highest block height and
   * going back lastNBlocks in time
   * @param  {Integer} lastNBlocks
   */
  async lastNBlockReport(lastNBlocks) {
    if (!parseInt(lastNBlocks)) {
      lastNBlocks = 0;
    }

    const endBlock = this.sharedCache.highestBlock;
    const startBlock = this.sharedCache.highestBlock - lastNBlocks;

    return await this.createReport(startBlock, endBlock);
  }
  /**
   * Convenience method to pre-load the database with block data.
   * @param  {} count
   */
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
