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
    infura.addTxToQueue(testTx.hash);

    expect(infura.queue.length).toBe(1);
    expect(infura.queue[0].params).toBe(testTx.hash);
    expect(infura.queue[0].op).toBe("getTransaction");
  });

  it("fetches the latest block number", async () => {
    let number = await infura.getLatestBlockNumber();

    expect(number > 13392228).toBe(true); // 13392228 latest at time of test
  });
});
