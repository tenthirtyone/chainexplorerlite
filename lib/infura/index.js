const Web3 = require("web3-eth");
const Logger = require("../logger");
const { oneSecond } = require("../util/constants");
const { Cache, sharedCache } = require("../cache");
const DB = require("../db");

class Infura {
  constructor(config) {
    this.db = new DB();
    this.config = { ...Infura.DEFAULTS, ...config };
    this.logger = new Logger("Infura");
    this.cache = new Cache();
    this.sharedCache = sharedCache;
    this.eventLoop = null;
    this.queue = [];
    this.web3 = null;
    this.listener = null;

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
    if (this.cache.exists(number) || this.sharedCache.exists(number)) return;

    this.logger.info(`Adding block ${number} to work queue`);
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
        if (this.cache.exists(tx.blockNumber)) {
          const block = this.cache.get(tx.blockNumber);

          block.transactions.push(tx);
          if (block.totalTx === block.transactions.length) {
            this.saveBlockToDB(block);
          }
        }
      },
    });
  }

  async saveBlockToDB(block) {
    const { Block, Transaction } = this.db;
    block.uncles = block.uncles.length || 0;
    let b = Block.build({
      ...block,
    });

    await b.save();

    block.transactions.forEach(async (tx) => {
      await Transaction.build({ ...tx }).save();
    });

    await b.save();

    this.sharedCache.add(b.number, block);
    this.cache.delete(b.number);
    this.logger.info(`Saved & cached ${b.number}`);
  }

  async getLatestBlockNumber() {
    return (await this.web3.getBlock("latest")).number;
  }

  async fetchLastNBlocks(count) {
    let currentBlock = await this.getLatestBlockNumber();

    for (let i = currentBlock; i > currentBlock - count; i--) {
      setTimeout(() => {
        this.addBlockToQueue(i);
      });
    }
  }

  static get DEFAULTS() {
    return {
      eventLoopTimer: oneSecond / (process.env.INFURA_TPS || 15),
      projectId: process.env.INFURA_PROJECT_ID,
    };
  }
}

module.exports = Infura;
