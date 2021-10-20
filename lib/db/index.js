const Logger = require("../logger");
const Sequelize = require("sequelize");
const { Block, Report, Transaction } = require("./models");

class DB {
  /**
   * Sequelize connection to an in-memory sqlite database
   * @param  {Object} config
   */
  constructor(config) {
    this.config = { ...DB.DEFAULTS, ...config };
    this.logger = new Logger(this.config.name);
    this.logger.info(`Database connection opening for: ${this.config.name}`);

    this.sequelize = new Sequelize({
      dialect: this.config.dialect || "sqlite",
      storage: this.config.storage || "memory",
      database: this.config.database || "homework",
      logging: (msg) => {
        this.config.muteLogging ? null : this.logger.info(msg);
      },
    });

    this.Block = this.sequelize.define("block", Block);
    this.Report = this.sequelize.define("report", Report);
    this.Transaction = this.sequelize.define("transaction", Transaction);

    this.Block.hasMany(this.Transaction, { foreignKey: "blockNumber" });
    this.Transaction.belongsTo(this.Block);

    this.Block.belongsToMany(this.Report, { through: "ReportBlocks" });
    this.Report.belongsToMany(this.Block, { through: "ReportBlocks" });

    this.sync();
    this.logger.info("Database started");
  }
  /**
   * Performs all the required db migrations
   */
  async sync() {
    await this.sequelize.sync();
  }
  /**
   * Shutdown the db
   */
  close() {
    this.sequelize?.close();
  }
  /**
   * Sequelize is very chatty and constantly adding blocks/txs to the db
   * will drown out the terminal if you are using the cli. Logging is
   * muted by default
   */
  toggleLogging() {
    this.config.muteLogging = !this.config.muteLogging;
  }

  static get DEFAULTS() {
    return {
      dialect: process.env.DATABASE_DIALECT || "sqlite",
      storage: process.env.DATABASE_STORAGE || "memory",
      database: process.env.DATABASE_NAME || "homework",
      muteLogging: process.env.DATABASE_MUTE_LOGS || true,
      name: "Database",
    };
  }
}

module.exports = DB;
