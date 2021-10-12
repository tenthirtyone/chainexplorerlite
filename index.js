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

  stop() {
    this.api.stop();
    this.infura.stop();
  }
  /**
   * Creates a report with the inclusive range startBlock - endBlock
   * @param  {Integer} startBlock
   * @param  {Integer} endBlock
   */
  async createReport(startBlock, endBlock) {
    startBlock = parseInt(startBlock, 10) || this.sharedCache.highestBlock;
    endBlock = parseInt(endBlock, 10) || this.sharedCache.highestBlock;

    const blockNumberList = this.createListOfBlockNumbers(startBlock, endBlock);
    const blockData = await this.infura.fetchListOfBlocks(blockNumberList);

    return this.reporter.createReport(startBlock, endBlock, blockData);
  }

  /**
   * Creates a report starting at the highest block height and
   * going back lastNBlocks in time
   * @param  {Integer} lastNBlocks
   */
  async lastNBlockReport(lastNBlocks) {
    lastNBlocks = parseInt(lastNBlocks, 10) || 0;

    const endBlock = this.sharedCache.highestBlock;
    const startBlock = this.sharedCache.highestBlock - lastNBlocks;

    return await this.createReport(startBlock, endBlock);
  }

  createListOfBlockNumbers(startBlock, endBlock) {
    const list = [];
    for (let i = startBlock; i <= endBlock; i++) {
      list.push(i);
    }
    return list;
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
