require("dotenv").config();
const expect = require("expect");
const Infura = require("../lib/infura");
const { blockData, transactionsData } = require("./data");

describe("Infura", () => {
  process.env.DATABASE_NAME = "test";
  let infura;
  let testBlock = blockData;
  let testTx = transactionsData[0];
  let testTxs = transactionsData;
  process.env.NODE_ENV = "test";

  beforeEach(async () => {
    infura = new Infura();
  });

  afterEach(async () => {
    infura.stop();
  });

  it("adds a block to the job queue", () => {
    infura.addBlockToFrontOfQueue(1e18);

    expect(infura.queue.length).toBe(1);
    expect(infura.queue[0].params[0]).toBe(1e18);
    expect(infura.queue[0].op).toBe("getBlock");
  });

  it("adds a block to the end of the job queue", () => {
    infura.addBlockToEndOfQueue(1e17);
    infura.addBlockToEndOfQueue(1e18);

    expect(infura.queue.length).toBe(2);
    expect(infura.queue[1].params[0]).toBe(1e18);
    expect(infura.queue[1].op).toBe("getBlock");
  });
  it("creates a getBlock job for the work queue", () => {
    const job = infura.createGetBlockJob(testBlock.number);

    expect(job.op).toBe("getBlock");
    expect(job.params[0]).toBe(testBlock.number);
    expect(job.params[1]).toBe(true);
    expect(typeof job.cb).toBe("function");
  });
  it("processes a job in the block queue", async () => {
    const job = infura.createGetBlockJob(testBlock.number);

    let block;
    job.cb = (b) => {
      block = b;
    };

    infura.queue.push(job);

    await infura.processBlockQueue();

    expect(block.number).toBe(testBlock.number);
    expect(block.transactions.length).toBe(testBlock.transactions.length);
    expect(block.hash).toBe(testBlock.hash);
  });
  it("fetches a list of blocks", async () => {
    const list = [
      testBlock.number,
      testBlock.number + 10,
      testBlock.number + 100,
    ];

    infura.sharedCache.add(testBlock.number + 100, true);

    const blocks = await infura.fetchListOfBlocks(list);

    expect(blocks.length).toBe(3);
  });
  it("will not double queue blocks", () => {
    infura.addBlockToEndOfQueue(1e18);
    infura.addBlockToEndOfQueue(1e18);
    infura.addBlockToFrontOfQueue(1e18);

    expect(infura.queue.length).toBe(1);
  });
  it("queues historical data at the end", () => {
    infura.queue.push(null);
    infura.fetchHistoricalBlockData(2000, 2010);

    expect(infura.queue.length).toBe(12);
    expect(infura.queue[0]).toBe(null);
  });
});
