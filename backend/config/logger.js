const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors, splat, colorize } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    // print stack trace for errors
    return `${timestamp} ${level}: ${message} - ${stack}`;
  }
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  format: combine(
    errors({ stack: true }), // <-- captures stack
    splat(),
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
  exitOnError: false,
});

// If we're in development, also log to the console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(colorize(), timestamp(), errors({ stack: true }), splat(), logFormat),
  }));
}

module.exports = logger;
