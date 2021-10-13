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
    infura.addBlockToFrontOfQueue(testBlock.number);

    expect(infura.queue.length).toBe(1);
    expect(infura.queue[0].params[0]).toBe(testBlock.number);
    expect(infura.queue[0].op).toBe("getBlock");
  });

  it("adds a block to the end of the job queue", () => {
    infura.queue.push(null);
    infura.addBlockToEndOfQueue(testBlock.number + 1);

    expect(infura.queue.length).toBe(2);
    expect(infura.queue[1].params[0]).toBe(testBlock.number + 1);
    expect(infura.queue[1].op).toBe("getBlock");
  });
  it("creates a getBlock job for the work queue", () => {
    const job = infura.createGetBlockJob(testBlock.number);

    expect(job.op).toBe("getBlock");
    expect(job.params[0]).toBe(testBlock.number);
    expect(job.params[1]).toBe(true);
    expect(typeof job.cb).toBe("function");
  });
  it("fetches a list of blocks", async () => {
    const list = [testBlock.number, testBlock.number];

    const blocks = await infura.fetchListOfBlocks(list);

    expect(blocks.length).toBe(2);
  });
});
