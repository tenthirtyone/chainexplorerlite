const Logger = require("../../logger");
const requestLogger = new Logger("API");

function logRequest(req, res, next) {
  requestLogger.info(`${req.method} ${req.originalUrl}`);
  return next();
}

module.exports = {
  logRequest,
};
