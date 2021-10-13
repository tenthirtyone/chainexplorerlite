const Web3 = require("web3-eth");
const Logger = require("../logger");
const { oneSecond } = require("../util/constants");
const { Cache, sharedCache } = require("../cache");
const DB = require("../db");

class Infura {
  /**
   * Infura / Block service. Utilizes web3 to listen for
   * new blocks, index and save them to cache/DB.
   * @param  {Object} config
   */
  constructor(config) {
    this.config = { ...Infura.DEFAULTS, ...config };
    this.db = new DB({ name: this.config.name });
    this.logger = new Logger(this.config.name);
    this.tempCache = new Cache({ name: "Infura tempCache" });
    this.sharedCache = sharedCache;
    this.eventLoop = null;
    this.queue = [];
    this.web3 = null;
    this.listener = null;
  }
  /**
   * Establish a socket connection with the infura provider.
   * TODO: make this a block service with generic provider strings
   * for better node/network support
   */
  initWeb3() {
    this.web3 = new Web3(
      new Web3.providers.WebsocketProvider(
        `wss://mainnet.infura.io/ws/v3/${this.config.projectId}`
      )
    );
  }

  /**
   * This service will establish a listener for new  blocks that are mined
   * and add new work into it's queue to process.
   */
  start() {
    this.logger.info("Infura starting...");
    const { eventLoopTimer } = this.config;

    this.initWeb3();

    this.listener = this.web3.subscribe("newBlockHeaders", (err, header) => {
      this.addBlockToFrontOfQueue(header.number);
    });

    this.eventLoop = setInterval(async () => {
      if (this.queue.length > 0) {
        this.processBlockQueue();
      }
    }, eventLoopTimer);

    this.logger.info("Infura started");
  }
  /**
   * Stop the service
   */
  stop() {
    this.stopWeb3();
    this.listener?.unsubscribe();
    this.db.close();
    clearInterval(this.eventLoop);
    this.logger.info("Infura stopped");
  }

  stopWeb3() {
    this.web3?.currentProvider.connection.close();
  }

  async processBlockQueue() {
    const job = this.queue.shift();
    job.cb(await this.web3[job.op](...job.params));
  }

  /**
   * Directly fetch a list of blocks, if the block is not
   * in the cache, fetch it from Infura, save & cache it.
   * @param  {Array} list
   */
  async fetchListOfBlocks(list) {
    const blocks = [];

    for (let i = 0; i < list.length; i++) {
      let block;
      let blockNumber = list[i];
      if (this.sharedCache.exists(blockNumber)) {
        block = this.sharedCache.get(blockNumber);
      } else {
        this.logger.info(`Fetching block ${blockNumber} from Infura`);
        this.tempCache.add(blockNumber, true);
        block = await this.web3.getBlock(blockNumber, true);
        this.sharedCache.add(blockNumber, block);
        this.saveBlockToDB(block); // no await, get data to user ASAP
      }
      blocks.push(block);
    }

    return blocks;
  }

  /**
   * Persist the block object in the db
   * @param  {Object} block
   */
  async saveBlockToDB(block) {
    const { Block, Transaction } = this.db;
    block.uncles = block.uncles.length || 0;
    try {
      let b = await Block.findOne({
        where: {
          number: block.number,
        },
      });

      // Ghetto upsert for reorgs
      if (b) {
        await Block.update({ ...block }, { where: { number: block.number } });
      } else {
        b = Block.build({
          ...block,
        });

        await b.save();
      }

      for (let i = 0; i < block.transactions.length; i++) {}
      block.transactions.forEach(async (tx) => {
        let t = await Transaction.findOne({ where: { hash: tx.hash } });

        if (t) {
          await Transaction.update({ ...tx }, { where: { hash: tx.hash } });
        } else {
          Transaction.build({ ...tx }).save();
        }
      });

      this.sharedCache.add(block.number, block);
      this.tempCache.delete(block.number);
      this.logger.info(`Saved & cached ${block.number}`);
    } catch (e) {
      this.logger.error(e);
    }
  }

  /**
   * Adds a block to the front of work queue for indexing, used for
   * new block listener
   * @param  {Integer} number
   */
  addBlockToFrontOfQueue(number) {
    if (this.tempCache.exists(number) || this.sharedCache.exists(number))
      return;

    this.tempCache.add(number, true);

    this.logger.info(`Adding block ${number} to the front of the work queue`);
    this.queue.unshift(this.createGetBlockJob(number));
  }
  /**
   * web3.getBlock operation for the work queue
   * @param  {Integer} number
   */
  createGetBlockJob(number) {
    return {
      op: "getBlock",
      params: [number, true],
      cb: (block) => {
        this.saveBlockToDB(block);
      },
    };
  }

  /*

    The functions below do not directly affect the user application and are 
    for indexing historical block data. 

  */

  /**
   * Adds a block to the end of work queue, used for indexing historical
   * block data
   * @param  {Integer} number
   */
  addBlockToEndOfQueue(number) {
    if (this.tempCache.exists(number) || this.sharedCache.exists(number))
      return;

    this.tempCache.add(number, true);

    this.logger.info(`Adding block ${number} to the end of work queue`);
    this.queue.push(this.createGetBlockJob(number));
  }

  /**
   * @param  {Integer} startBlock
   * @param  {Integer} endBlock
   */
  fetchHistoricalBlockData(startBlock, endBlock) {
    startBlock = parseInt(startBlock, 10) || 0;
    endBlock = parseInt(endBlock, 10) || 0;

    if (startBlock > endBlock) return;

    for (let i = startBlock; i <= endBlock; i++) {
      this.addBlockToEndOfQueue(i);
    }
  }

  static get DEFAULTS() {
    return {
      name: "Infura",
      eventLoopTimer: oneSecond / (process.env.INFURA_RPS || 15),
      projectId: process.env.INFURA_PROJECT_ID,
    };
  }
}

module.exports = Infura;
