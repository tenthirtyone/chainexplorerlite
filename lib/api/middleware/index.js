const Logger = require("../../logger");
const requestLogger = new Logger("API");
/**
 * Middleware the logs every api request method and path
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
function logRequest(req, res, next) {
  requestLogger.info(`${req.method} ${req.originalUrl}`);
  return next();
}

module.exports = {
  logRequest,
};
