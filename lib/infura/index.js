const Web3 = require("web3-eth");
const Logger = require("../logger");
const { oneSecond } = require("../util/constants");
const cache = require("../cache").cache;
const DB = require("../db");

// todo temp cache while indexing before moving over

class Infura {
  constructor(config) {
    this.db = new DB();
    this.config = { ...Infura.DEFAULTS, ...config };
    this.logger = new Logger("Infura");
    this.cache = cache;
    this.eventLoop = null;

    this.queue = [];
    this.web3 = new Web3(
      new Web3.providers.WebsocketProvider(
        `wss://mainnet.infura.io/ws/v3/${this.config.projectId}`
      )
    );
  }

  start() {
    const { eventLoopTimer } = this.config;
    this.eventLoop = setInterval(async () => {
      if (this.queue.length > 0) {
        const job = this.queue.shift();
        this.logger.info(`${job.op}-${job.params}`);
        job.cb(await this.web3[job.op](job.params));
      }
    }, eventLoopTimer);
  }

  stop() {
    clearInterval(this.eventLoop);
  }

  addBlockToQueue(number) {
    this.queue.push({
      op: "getBlock",
      params: number,
      cb: (block) => {
        console.log(block);
        block.txData = [];

        // Add Block to cache
        this.cache.add(number, block);
        // add Txs To Queue
        block.transactions.forEach((hash) => {
          this.addTxToQueue(hash);
        });
      },
    });
  }

  addTxToQueue(hash) {
    this.queue.push({
      op: "getTransaction",
      params: hash,
      cb: (tx) => {
        console.log(tx);
        //this.cache.add(hash, tx);
        const block = this.cache.get(tx.blockNumber);
        block.txData.push(tx);
        // Check if cache'd block tx count = cached txs

        if (block.txData.length === block.transactions.length) {
          // Save complete block to db.

          console.log(block);
        }
      },
    });
  }

  static get DEFAULTS() {
    return {
      eventLoopTimer: oneSecond / 10,
      projectId:
        process.env.INFURA_PROJECT_ID || "4d0cb3156ad04578b2f11518981edf30",
    };
  }
}

module.exports = Infura;
