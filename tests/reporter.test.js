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

  it("checks the shared cache for block data", async () => {
    const block = reporter.db.Block.build({ ...testBlock });
    await block.save();

    sharedCache.add(block.number, block);

    await reporter.createReport(testBlock.number, testBlock.number);

    let r = await reporter.db.Report.findAll({ include: reporter.db.Block });

    console.log(r);
    expect();
    sharedCache.delete(100);
  });
});
