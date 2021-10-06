const API = require("./lib/api");
const config = require("./config");
const Logger = require("./lib/logger");

class Explorer {
  constructor(config) {
    this.config = config;
    this.logger = new Logger("Explorer");
    this.api = new API();
  }

  start() {
    this.logger.info("Explorer starting...");
    // Start DB
    this.api.start();
    this.logger.info("Explorer started.");
  }
}

if (require.main === module) {
  const explorer = new Explorer();
  explorer.start();
} else {
  module.exports = Explorer;
}
