const expect = require("expect");
const DB = require("../lib/db");
const { blockData, transactionsData } = require("./data");

describe("DB", () => {
  let db;
  let database = "test";
  let testBlock = blockData;
  let testTx = transactionsData[0];
  let testTxs = transactionsData;

  beforeEach(async () => {
    db = new DB({ database });
    await db.sync();
  });

  afterEach(async () => {
    await db.sequelize.drop();
    db.close();
  });

  it("saves a block", async () => {
    const { Block } = db;
    Block.build({
      ...testBlock,
    }).save();

    let blocks = await Block.findAll({
      where: { number: testBlock.number },
    });

    expect(blocks.length).toBe(1);
    let block = blocks[0];
    expect(block.number).toBe(testBlock.number);
    expect(block.hash).toBe(testBlock.hash);
  });

  it("adds a tx to a block", async () => {
    db.Block.build({
      number: 1,
      hash: "lolol",
    }).save();

    db.Transaction.build({
      hash: "hashlolol",
      blockNumber: 1,
    }).save();

    let blocks = await db.Block.findAll({
      where: { number: 1 },
      include: db.Transaction,
    });

    let b = blocks[0];

    expect(b.transactions.length).toBe(1);
  });
});
