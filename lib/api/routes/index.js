const router = require("express").Router();

router.get("/report/range/:startBlock/:endBlock", async (req, res) => {
  const explorer = req.app.get("explorer");
  const { startBlock, endBlock } = req.params;

  const report = await explorer.createReport(
    parseInt(startBlock),
    parseInt(endBlock)
  );

  res.json(report);
});
router.get("/report/last/:lastNBlocks", async (req, res) => {
  const explorer = req.app.get("explorer");
  let { lastNBlocks } = req.params;

  if (!parseInt(lastNBlocks)) {
    lastNBlocks = 0;
  }

  const endBlock = explorer.sharedCache.highestBlock;
  const startBlock = explorer.sharedCache.highestBlock - lastNBlocks;

  const report = await explorer.createReport(startBlock, endBlock);

  res.json(report);
});

router.use("*", (req, res) => {
  res.status(404).send("Custom 404");
});

module.exports = router;
