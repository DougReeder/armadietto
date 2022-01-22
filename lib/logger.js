const winston = require('winston');
const {format} = winston;
const {printf} = format;
const path = require('path');

function configureLogger (options) {
  // provided log_dir should be an absolute path where logs
  // will reside. Otherwise it just logs them to the root dir
  // of your app
  const loggerPath = options.log_dir || '';

  const fileTransports = options.log_files.map(level => {
    // if we pass "combined", it's a special strategy that just
    // logs everything to a single file
    const settings = {
      filename: path.join(loggerPath, `${level}.log`)
    };

    if (level !== 'combined') {
      settings.level = level;
    }

    return new winston.transports.File(settings);
  });

  // journald will supply the date
  const minimalFormat = printf(({level, message}) => {
    return `${level}: ${message}`;
  });

  const consoleTransports = options.stdout.map(level => {
    // if we pass "combined", it's a special strategy that just
    // logs everything to a single file
    const settings = {};

    if (level !== 'combined') {
      settings.level = level;
    }
    if (!settings.format) {
      settings.format = minimalFormat;
    }

    return new winston.transports.Console(settings);
  });

  if (0 === fileTransports.length && 0 === consoleTransports.length) {
    consoleTransports.push(new winston.transports.Console({
      level: 'info',
      format: minimalFormat,
    }));
  }

  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      // we want to be able to pass an error object to the logger
      // and have it include a mini stack trace
      winston.format.errors({ stack: true }),
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: fileTransports.concat(consoleTransports)
  });

  return logger;
}

module.exports = configureLogger;
