const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors, splat, colorize } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    return `${timestamp} ${level}: ${message} - ${stack}`;
  }
  return `${timestamp} ${level}: ${message}`;
});

// Detect environment
const isProduction = process.env.NODE_ENV === 'production';

const loggerTransports = [];

// 🟢 In production (like Vercel) → log only to console
if (isProduction) {
  loggerTransports.push(
    new transports.Console({
      format: combine(colorize(), timestamp(), errors({ stack: true }), splat(), logFormat),
    })
  );
} else {
  // 🧑‍💻 Local development → log to console + files
  loggerTransports.push(
    new transports.Console({
      format: combine(colorize(), timestamp(), errors({ stack: true }), splat(), logFormat),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  );
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: combine(errors({ stack: true }), splat(), timestamp(), logFormat),
  transports: loggerTransports,
  exitOnError: false,
});

module.exports = logger;
