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

    this.sequelize.sync();
  }

  async sync() {
    await this.sequelize.sync();
  }

  async test() {
    const testBlock = this.Block.build({
      number: 1,
      hash: "lolol",
    });

    const testTx = this.Transaction.build({
      hash: "hashlolol",
      blockNumber: 1,
    });

    testBlock.save();
    testTx.save();

    testBlock.addTransactions([testTx]);
    testBlock.save();

    let b = await this.Block.findAll({
      where: { number: 1 },
      include: this.Transaction,
    });

    let t = await this.Transaction.findAll({
      where: { blockNumber: 1 },
    });

    console.log(b[0]);
    console.log(b[0].transactions);
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
