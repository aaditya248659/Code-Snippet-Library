// Lightweight fallback logger module.
// The original implementation used winston with file transports.
// To simplify the codebase and avoid external dependencies, we provide
// a minimal console-backed logger with the same API used across the app.

const logger = {
  info: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  debug: (...args) => (console.debug ? console.debug(...args) : console.log(...args)),
};

module.exports = logger;
