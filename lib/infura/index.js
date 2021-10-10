const Web3 = require("web3-eth");
const Logger = require("../logger");
const { oneSecond } = require("../util/constants");
const { sharedCache } = require("../cache");
const DB = require("../db");

// todo temp cache while indexing before moving over to shared cache

class Infura {
  constructor(config) {
    this.db = new DB();
    this.config = { ...Infura.DEFAULTS, ...config };
    this.logger = new Logger("Infura");
    this.cache = sharedCache;
    this.eventLoop = null;
    this.eventLoopId;
    this.queue = [];
    this.web3 = null;
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
        job.cb(await this.web3[job.op](job.params));
      }
    }, eventLoopTimer);
  }

  stop() {
    this.web3?.currentProvider.connection.close();
    clearInterval(this.eventLoop);
  }

  addBlockToQueue(number) {
    this.queue.push({
      op: "getBlock",
      params: number,
      cb: (block) => {
        this.cache.add(number, block);
        block.transactions.forEach((hash) => {
          this.addTxToQueue(hash);
        });
        block.transactions = [];
      },
    });
  }

  addTxToQueue(hash) {
    this.queue.push({
      op: "getTransaction",
      params: hash,
      cb: (tx) => {
        const block = this.cache.get(tx.blockNumber);
        block.transactions.push(tx);
        if (block.transactions.length === block.transactions.length) {
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
