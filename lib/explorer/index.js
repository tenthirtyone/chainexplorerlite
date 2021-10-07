const Cache = require("../cache");

class Explorer {
  constructor() {
    this.cache = new Cache();
    //this.infura = new Infura()
  }

  getBlockData() {
    // Check Cache for block, if not in cache, check DB, if not in DB, call the infura service to get the data.
  }
}

module.exports = Explorer;
