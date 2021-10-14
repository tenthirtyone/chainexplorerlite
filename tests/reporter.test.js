process.env.DATABASE_NAME = "test";
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

    reporter.start();
  });

  afterEach(() => {
    reporter.stop();
  });

  it("creates a list of block numbers", () => {
    const startBlock = 1;
    const endBlock = 10;
    const list = reporter.createListOfBlockNumbers(startBlock, endBlock);

    expect(list.length).toBe(10);
    for (let i = startBlock; i <= endBlock; i++) {
      expect(list.indexOf(i) >= 0).toBe(true);
    }
  });
  it("parses block data into a report", async () => {
    const startBlock = 1;
    const endBlock = 10;
    const list = reporter.createListOfBlockNumbers(startBlock, endBlock);

    const blocks = await reporter.infura.fetchListOfBlocks(list);

    const report = reporter.parseReportData(blocks);

    expect(report.summary.totalSent).toBe(0);
  });
  it("creates a report based on a range of blocks", async () => {
    let startBlock = 13407900;
    let endBlock = 13407901;
    await reporter.infura.fetchHistoricalBlockData(startBlock, endBlock);

    const report = await reporter.createRangeReport(startBlock, endBlock);

    expect(report.summary.totalSent === '147.129237190786059927').toBe(true);
    expect(report.summary.totalUncles === 0).toBe(true);
    expect(report.summary.uniqueSenders === 296).toBe(true);
    expect(report.summary.uniqueReceivers === 214).toBe(true);
    expect(report.summary.contractsCreated === 1).toBe(true);
    expect(report.summary.uniqueAddresses === 506).toBe(true);
    expect(Object.keys(report.senders).length).toBe(296);
    expect(Object.keys(report.receivers).length).toBe(214);
    expect(report.contracts.length).toBe(239);
  });
  it("creates a report based on the last N blocks from the most recent block", async () => {
    let startBlock = 13407900;
    let endBlock = 13407901;
    await reporter.infura.fetchHistoricalBlockData(startBlock, endBlock);

    const report = await reporter.createLastNReport(1);

    expect(report.summary.totalSent === '147.129237190786059927').toBe(true);
    expect(report.summary.totalUncles === 0).toBe(true);
    expect(report.summary.uniqueSenders === 296).toBe(true);
    expect(report.summary.uniqueReceivers === 214).toBe(true);
    expect(report.summary.contractsCreated === 1).toBe(true);
    expect(report.summary.uniqueAddresses === 506).toBe(true);
    expect(Object.keys(report.senders).length).toBe(296);
    expect(Object.keys(report.receivers).length).toBe(214);
    expect(report.contracts.length).toBe(239);
  });

  it("will set start/end blocks to the highest block if no number is given", async () => {
    await reporter.createRangeReport(null, null);
  });
  it("will set n to 0 if no number is given", async () => {
    await reporter.createLastNReport(null);
  });
});
