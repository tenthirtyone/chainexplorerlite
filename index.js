require("dotenv").config();
const API = require("./lib/api");
const Logger = require("./lib/logger");

class Explorer {
  constructor() {
    this.logger = new Logger("App");
    this.api = new API();
  }

  start() {
    this.logger.info("App starting...");
    // Start DB
    this.api.start();
    this.logger.info("App started.");
  }
}

if (require.main === module) {
  const explorer = new Explorer();
  explorer.start();
} else {
  module.exports = Explorer;
}
