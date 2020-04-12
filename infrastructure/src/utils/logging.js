const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        prettyPrint()
    ),
    // defaultMeta: { service: 'user-service' },
    transports: [
        new transports.File({ filename: 'application.log' }),
        new transports.File({ filename: 'error.log', level: 'warn', handleExceptions: true, exitOnError: false })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.simple()
    }));
}

logger.on('finish', function (info) {
    // All `info` log messages has now been logged
});

module.exports = logger;
