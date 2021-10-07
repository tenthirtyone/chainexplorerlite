const Logger = require("../logger");
const express = require("express");
const routes = require("./routes");
const { logRequest } = require("./middleware");

class API {
  constructor(config) {
    this.config = { ...API.DEFAULTS, ...config };
    this.logger = new Logger("API");
    this.express = express();
    this.routes = routes;
    this.express.set("trust_proxy", this.config.trustProxy);
    this.express.set("json spaces", this.config.jsonSpaces);
    this.express.use(express.static("./client/build"));
    this.express.use(logRequest);
    this.express.use("/api", this.routes);
  }

  start() {
    const { port } = this.config;
    this.server = this.express.listen(port, () => {
      this.logger.info(`Listening on ${port}`);
    });
  }

  stop() {
    this.server.close();
  }

  static get DEFAULTS() {
    return {
      trustProxy: 1, // Required for load balancer / reverse proxy
      jsonSpaces: 2,
      port: process.env.SERVER_PORT || 4000,
    };
  }
}

module.exports = API;
