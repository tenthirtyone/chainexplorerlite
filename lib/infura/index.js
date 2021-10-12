const Web3 = require("web3-eth");
const Logger = require("../logger");
const { oneSecond } = require("../util/constants");
const { Cache, sharedCache } = require("../cache");
const DB = require("../db");

class Infura {
  /**
   * Infura / Block service. Utilizes web3 to listen for
   * new blocks, index and save them to cache/DB. Runs
   * as close to Ethereum's TPS as possible or faster.
   *
   * @param  {Object} config
   */
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
   * This service is scheduled to run as close to Ethereum's TPS
   * as possible, or faster. It will establish a listener for new
   * blocks that are mined and add new work into it's queue.
   */
  start() {
    const { eventLoopTimer } = this.config;

    this.initWeb3();

    this.listener = this.web3.subscribe("newBlockHeaders", (err, header) => {
      this.addBlockToQueue(header.number);
    });

    this.eventLoop = setInterval(async () => {
      if (this.queue.length > 0) {
        const job = this.queue.shift();
        job.cb(await this.web3[job.op](...job.params));
      }
    }, eventLoopTimer);
  }
  /**
   * Stop the service
   */
  stop() {
    this.web3?.currentProvider.connection.close();
    this.listener?.unsubscribe();
    clearInterval(this.eventLoop);
  }
  /**
   * Adds a block into the work queue for indexing by block number.
   * If the block already exists in the temp cache, or sharedCache,
   * it is ignored as it has already been indexed.
   * TODO: I left handling of reorgs out of scope for this project.
   * @param  {Integer} number
   */
  addBlockToQueue(number) {
    if (this.cache.exists(number) || this.sharedCache.exists(number)) return;

    //this.logger.info(`Adding block ${number} to work queue`);
    this.queue.push({
      op: "getBlock",
      params: [number, true],
      cb: (block) => {
        this.cache.add(number, block);
        this.saveBlockToDB(block);
      },
    });
  }

  /**
   * After the Infura service fetches the block & tx
   * data it persists and associates then in the db.
   * It removes the block from the temp/local cache
   * and moves it into the sharedCache
   * @param  {Object} block
   */
  async saveBlockToDB(block) {
    const { Block, Transaction } = this.db;
    block.uncles = block.uncles.length || 0;
    let b = Block.build({
      ...block,
    });

    await b.save();

    for (let i = 0; i < block.transactions.length; i++) {}
    block.transactions.forEach(async (tx) => {
      await Transaction.build({ ...tx }).save();
    });

    this.sharedCache.add(b.number, block);
    this.cache.delete(b.number);
    this.logger.info(`Saved & cached ${b.number}`);
  }
  /**
   * returns 'latest' block number from Infura
   */
  async getLatestBlockNumber() {
    return (await this.web3.getBlock("latest")).number;
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
        block = await this.web3.getBlock(blockNumber, true);
        await this.saveBlockToDB(block);
      }
      blocks.push(block);
    }

    return blocks;
  }

  static get DEFAULTS() {
    return {
      eventLoopTimer: oneSecond / (process.env.INFURA_TPS || 15),
      projectId: process.env.INFURA_PROJECT_ID,
    };
  }
}

module.exports = Infura;
