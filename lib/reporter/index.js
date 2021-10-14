const { sharedCache } = require("../cache");
const Infura = require("../infura");
const Logger = require("../logger");
const BigNumber = require('bignumber.js');

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
    this.bn = BigNumber;
  }

  start() {
    this.logger.info("Reporting service starting...");
    this.infura.start();
  }

  stop() {
    this.infura.stop();
    this.logger.info("Reporting service stopped.");
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

    const { highestBlock } = this.sharedCache;

    if (lastNBlocks < 0) lastNBlocks = 0;

    const startBlock = highestBlock - lastNBlocks;
    const endBlock = highestBlock;

    return await this.createRangeReport(startBlock, endBlock);
  }

  /**
   * Returns report data from startBlock to endBlock
   * @param  {Integer} startBlock
   * @param  {Integer} endBlock
   */
  async createRangeReport(startBlock, endBlock) {
    const { highestBlock } = this.sharedCache;
    startBlock = parseInt(startBlock, 10) || highestBlock;
    endBlock = parseInt(endBlock, 10) || highestBlock;

    if (startBlock < 0) startBlock = highestBlock;
    if (endBlock < 0) endBlock = highestBlock;

    const blockNumberList = this.createListOfBlockNumbers(startBlock, endBlock);
    const data = await this.infura.fetchListOfBlocks(blockNumberList);

    return {
      startBlock,
      endBlock,

      ...this.parseReportData(data),
    };
  }

  addBigNumber(num1, num2) {
    return this.bn(num1).plus(num2).toString()
  }

  weiToEth(num) {
    return this.bn(num).dividedBy(1e18).toString();
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
        
        const ethSent = this.weiToEth(tx.value)

        summary.totalSent = this.addBigNumber(summary.totalSent, ethSent);
        // Null addr = contract created (0x000...)
        if (tx.to === null) {
          summary.contractsCreated++;
        } else {
          senders[tx.from] === undefined
            ? (senders[tx.from] = ethSent)
            : (senders[tx.from] = this.addBigNumber(ethSent, senders[tx.from]));
        }

        receivers[tx.to] === undefined
          ? (receivers[tx.to] = ethSent)
          : (receivers[tx.to] = this.addBigNumber(ethSent, receivers[tx.to]));

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
}

module.exports = Reporter;
