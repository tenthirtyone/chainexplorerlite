const router = require("express").Router();

router.get("/ping", (req, res) => {
  res.send(true);
});

router.use("*", (req, res) => {
  res.status(404).send("Custom 404");
});

module.exports = router;
