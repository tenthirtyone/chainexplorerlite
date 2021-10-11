const router = require("express").Router();

router.get("/report/range/:startBlock/:endBlock", async (req, res) => {
  const explorer = req.app.get("explorer");
  const { startBlock, endBlock } = req.params;

  const report = await explorer.createReport(startBlock, endBlock);

  res.json(report);
});
router.get("/report/last/:lastNBlocks", async (req, res) => {
  const explorer = req.app.get("explorer");
  let { lastNBlocks } = req.params;

  const report = await explorer.lastNBlockReport(lastNBlocks);

  res.json(report);
});

router.use("*", (req, res) => {
  res.status(404).send("Custom 404");
});

module.exports = router;
