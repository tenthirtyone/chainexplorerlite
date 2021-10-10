const Logger = require("../logger");
const Sequelize = require("sequelize");
const { Block, Transaction } = require("./models");

class DB {
  constructor(config) {
    this.config = { ...DB.DEFAULTS, ...config };
    this.logger = new Logger("Database");
    this.sequelize = new Sequelize({
      dialect: this.config.dialect || "sqlite",
      storage: this.config.storage || "memory",
      database: this.config.database || "homework",
      logging: (msg) => {
        this.logger.info(msg);
      },
    });

    this.Block = this.sequelize.define("block", Block);
    this.Transaction = this.sequelize.define("transaction", Transaction);
    this.Block.hasMany(this.Transaction, { foreignKey: "blockNumber" });
    this.Transaction.belongsTo(this.Block);

    this.sync();
  }

  async sync() {
    await this.sequelize.sync();
  }

  close() {
    this.sequelize?.close();
  }

  static get DEFAULTS() {
    return {
      dialect: "sqlite",
      storage: "memory",
      database: "homework",
    };
  }
}

module.exports = DB;
