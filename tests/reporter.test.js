const expect = require("expect");
const Reporter = require("../lib/reporter");
const { blockData, transactionsData } = require("./data");
const { sharedCache } = require("../lib/cache");

describe("Reporter", () => {
  let reporter;
  let testBlock = blockData;
  let testTx = transactionsData[0];
  let testTxs = transactionsData;

  beforeEach(async () => {
    reporter = new Reporter();
  });

  afterEach(() => {});

  it("gets the report data from cached block data", async () => {
    const block = reporter.db.Block.build({ ...testBlock });

    sharedCache.add(block.number, block);
    sharedCache.add(block.number + 1, block);
    sharedCache.add(block.number + 2, block);
    sharedCache.add(block.number + 3, block);

    let r = await reporter.createReport(testBlock.number, testBlock.number + 3);

    expect(r.length).toBe(4);
  });
});
