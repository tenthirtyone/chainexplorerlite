const Logger = require("../logger");

class DB {
  constructor(config) {
    this.config = config;
    this.logger = new Logger("Database");
  }
}

module.exports = DB;
