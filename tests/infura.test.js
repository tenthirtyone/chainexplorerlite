require("dotenv").config();
const expect = require("expect");
const Infura = require("../lib/infura");
const { blockData, transactionsData } = require("./data");

describe("Infura", () => {
  let infura;
  let testBlock = blockData;
  let testTx = transactionsData[0];
  let testTxs = transactionsData;

  beforeEach(async () => {
    infura = new Infura();
  });

  afterEach(() => {
    infura.stop();
  });

  it("adds a block to the job queue", () => {
    infura.addBlockToQueue(testBlock.number);

    expect(infura.queue.length).toBe(1);
    expect(infura.queue[0].params).toBe(testBlock.number);
    expect(infura.queue[0].op).toBe("getBlock");
  });

  it("adds a tx to the job queue", () => {
    infura.addTxToQueue(textTx);

    expect(infura.queue.length).toBe(1);
    expect(infura.queue[0].params).toBe(testBlock.number);
    expect(infura.queue[0].op).toBe("getBlock");
  });
});
