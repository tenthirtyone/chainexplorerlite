const expect = require("expect");
const Reporter = require("../lib/reporter");
const { blockData, transactionsData } = require("./data");
const { sharedCache } = require("../lib/cache");

describe("Reporter", () => {
  process.env.DATABASE_NAME = "test";
  let reporter;
  let testBlock = blockData;
  let testTx = transactionsData[0];
  let testTxs = transactionsData;

  beforeEach(async () => {
    reporter = new Reporter();
    reporter.start();
  });

  afterEach(() => {
    reporter.stop();
  });
});
