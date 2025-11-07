const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors, splat, colorize } = format;
const fs = require('fs');
const path = require('path');

// Directory for local logs
const logDir = path.join(__dirname, '../logs');

// Only create logs folder locally (not in production)
if (process.env.NODE_ENV !== 'production') {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

const logFormat = printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    return `${timestamp} ${level}: ${message} - ${stack}`;
  }
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  format: combine(errors({ stack: true }), splat(), timestamp(), logFormat),

  transports:
    process.env.NODE_ENV === 'production'
      ? [
          // ✅ On Vercel, only log to console
          new transports.Console({
            format: combine(colorize(), timestamp(), logFormat),
          }),
        ]
      : [
          // ✅ Locally: log to files + console
          new transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
          }),
          new transports.File({
            filename: path.join(logDir, 'combined.log'),
          }),
          new transports.Console({
            format: combine(colorize(), timestamp(), errors({ stack: true }), splat(), logFormat),
          }),
        ],

  exitOnError: false,
});

module.exports = logger;
