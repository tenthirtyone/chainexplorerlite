const { sharedCache } = require("../cache");
const Infura = require("../infura");
const Logger = require("../logger");

class Reporter {
  /**
   * Assembles, and parses block data into reports
   * @param  {Object} config
   */
  constructor(config) {
    this.logger = new Logger("Reporter");
    this.config = { ...config };
    this.infura = new Infura();
    this.sharedCache = sharedCache;
  }

  start() {
    this.infura.start();
  }

  stop() {
    this.infura.stop();
  }
  /**
   * Creates an inclusive array of integers from startBlock
   * to endBlock
   * @param  {Integer} startBlock
   * @param  {Integer} endBlock
   */
  createListOfBlockNumbers(startBlock, endBlock) {
    const list = [];
    for (let i = startBlock; i <= endBlock; i++) {
      list.push(i);
    }
    return list;
  }
  /**
   * Returns report data for the lastNBlocks from the highest
   * known block
   * @param  {Integer} lastNBlocks
   */
  async createLastNReport(lastNBlocks) {
    lastNBlocks = parseInt(lastNBlocks, 10) || 0;

    const startBlock = this.sharedCache.highestBlock - lastNBlocks;
    const endBlock = this.sharedCache.highestBlock;

    return await this.createRangeReport(startBlock, endBlock);
  }
  /**
   * Returns report data from startBlock to endBlock
   * @param  {Integer} startBlock
   * @param  {Integer} endBlock
   */
  async createRangeReport(startBlock, endBlock) {
    startBlock = parseInt(startBlock, 10) || this.sharedCache.highestBlock;
    endBlock = parseInt(endBlock, 10) || this.sharedCache.highestBlock;

    const blockNumberList = this.createListOfBlockNumbers(startBlock, endBlock);
    const data = await this.infura.fetchListOfBlocks(blockNumberList);

    return {
      startBlock,
      endBlock,

      ...this.parseReportData(data),
    };
  }
  /**
   * Parses the report data from a list of blocks from
   * the infura service
   * @param  {Array} data
   */
  parseReportData(data) {
    const addresses = [];

    const senders = {};
    const receivers = {};
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
          senders[tx.from] === undefined
            ? (senders[tx.from] = parseInt(tx.value))
            : (senders[tx.from] += parseInt(tx.value));
        }

        receivers[tx.to] === undefined
          ? (receivers[tx.to] = parseInt(tx.value))
          : (receivers[tx.to] += parseInt(tx.value));

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

    summary.totalSent = summary.totalSent / 1e18;

    return {
      summary,
      senders,
      receivers,
      contracts,
    };
  }
}

module.exports = Reporter;
