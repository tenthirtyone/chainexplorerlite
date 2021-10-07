const Logger = require("../logger");
const Sequelize = require("sequelize");
const { Block } = require("./models");

class DB {
  constructor(config) {
    this.config = config;
    this.logger = new Logger("Database");
    this.sequelize = new Sequelize({
      dialect: "sqlite",
      storage: "memory",
      database: "homework",
      logging: this.logger.info,
    });

    this.Block = this.sequelize.define("block", Block);
    this.sequelize.sync();
  }

  test() {
    const testBlock = this.Block.build({
      number: 1,
      hash: "lolol",
    });

    console.log(testBlock);
    console.log(testBlock.number);
  }

  close() {
    this.sequelize.close();
  }
}

module.exports = DB;
