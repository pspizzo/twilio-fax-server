const winston = require('winston');

const myFormat = winston.format.printf(info => {
    return `${info.timestamp} FAX [${info.level}] : ${info.message}` +
        (info.meta instanceof Error ? `, ${info.meta.message}` : '');
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.splat(),
        myFormat
    ),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;
