const Web3 = require("web3-eth");
const Logger = require("../logger");
const { oneSecond } = require("../util/constants");
const { Cache, sharedCache } = require("../cache");
const DB = require("../db");

// todo temp cache while indexing before moving over to shared cache

class Infura {
  constructor(config) {
    this.db = new DB();
    this.config = { ...Infura.DEFAULTS, ...config };
    this.logger = new Logger("Infura");
    this.cache = new Cache();
    this.sharedCache = sharedCache;
    this.eventLoop = null;
    this.eventLoopId;
    this.queue = [];
    this.web3 = null;
    this.listener = null;
    this.highestBlock = -1;
    this.initWeb3();
  }

  initWeb3() {
    this.web3 = new Web3(
      new Web3.providers.WebsocketProvider(
        `wss://mainnet.infura.io/ws/v3/${this.config.projectId}`
      )
    );
  }

  start() {
    const { eventLoopTimer } = this.config;

    this.initWeb3();

    this.listener = this.web3.subscribe("newBlockHeaders", (err, header) => {
      this.addBlockToQueue(header.number);
    });

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
    this.listener?.unsubscribe();
    clearInterval(this.eventLoop);
  }

  addBlockToQueue(number) {
    if (this.cache.exists(number)) return;

    this.queue.push({
      op: "getBlock",
      params: number,
      cb: (block) => {
        this.cache.add(number, block);
        block.transactions.forEach((hash) => {
          this.addTxToQueue(hash);
        });
        block.totalTx = block.transactions.length;
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
        if (block.totalTx === block.transactions.length) {
          this.saveBlockToDB(block);
          if (this.highestBlock < block.number) {
            this.highestBlock = block.number;
          }
        }
      },
    });
  }

  async saveBlockToDB(block) {
    const { Block, Transaction } = this.db;

    let b = Block.build({
      ...block,
    });

    await b.save();

    block.transactions.forEach(async (tx) => {
      await Transaction.build({ ...tx }).save();
    });

    await b.save();

    this.sharedCache.add(b.number, b);
    this.cache.delete(b.number);
  }

  async getLatestBlockNumber() {
    return (await this.web3.getBlock("latest")).number;
  }

  static get DEFAULTS() {
    return {
      eventLoopTimer: oneSecond / 50,
      projectId:
        process.env.INFURA_PROJECT_ID || "4d0cb3156ad04578b2f11518981edf30",
    };
  }
}

module.exports = Infura;
