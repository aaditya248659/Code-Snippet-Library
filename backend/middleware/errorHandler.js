const logger = require('../config/logger');

// 404 handler
function notFound(req, res, next) {
  res.status(404);
  res.json({ message: `Not Found - ${req.originalUrl}` });
}

// Generic error handler
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);

  logger.error(err instanceof Error ? err.stack || err.message : err);

  res.json({
    message: err.message || 'Internal Server Error',
    // show stack only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
