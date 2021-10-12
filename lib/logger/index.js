const bunyan = require("bunyan");
const bformat = require("bunyan-format");
const formatOut = bformat({
  outputMode: "short",
});

class Logger {
  /**
   * Outputs application info to stdout at the class level
   * @param  {String} name
   * @param  {Object} config={}
   */
  constructor(name, config = {}) {
    this.config = { ...Logger.DEFAULTS, ...config };
    this.config.name = name || config.name;

    const logger = bunyan.createLogger(this.config);
    logger.name = this.config.name;
    logger.config = this.config;
    logger.level(this.config.level);
    return logger;
  }

  static get DEFAULTS() {
    return {
      name: "logger",
      level:
        process.env.NODE_ENV === "test"
          ? 100
          : process.env.NODE_ENV === "debug"
          ? "debug"
          : "info",

      streams: [
        {
          type: "file",
          path: `/tmp/logger.log`,
          period: "1d",
          count: 30,
        },
        {
          stream: formatOut,
        },
      ],
    };
  }
}

module.exports = Logger;
