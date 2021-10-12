const { sharedCache } = require("../cache");
const Logger = require("../logger");

class Reporter {
  /**
   * Assembles, and parses block data from
   * the sharedCache
   * @param  {Object} config
   */
  constructor(config) {
    this.logger = new Logger("Reporter");
    this.config = { ...config };
    this.sharedCache = sharedCache;
  }

  createReport(startBlock, endBlock, data) {
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
      startBlock,
      endBlock,
      summary,
      senders,
      receivers,
      contracts,
    };
  }
}

module.exports = Reporter;
