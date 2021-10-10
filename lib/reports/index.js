const { sharedCache } = require("../cache");

class Explorer {
  constructor() {
    this.cache = new sharedCache();
    //this.infura = new Infura()
  }

  getBlockData() {
    // Check Cache for block, if not in cache, call the infura service to get the data.
  }
}

module.exports = Explorer;
