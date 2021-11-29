import winston from "winston";
import fs from 'fs-extra';
import 'winston-daily-rotate-file';

fs.ensureDirSync('data/logs');

const dailyTransport = new winston.transports.DailyRotateFile({
    filename: 'data/logs/weskic-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info'
});

const transportsProduction = [
    dailyTransport,
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}` + (info.splat !== undefined ? `${info.splat}` : " ")),
        )
    })
];
const transportsDev = [
    dailyTransport,
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message instanceof Object ? JSON.stringify(info.message) : info.message}` + (info.splat !== undefined ? `${info.splat}` : " ")),
        )
    })
];

export function getLogger(PROD) {
    return winston.createLogger({
        level: 'debug',
        format: winston.format.combine(
            winston.format.timestamp({format: 'YYY-MM-DD HH:mm:ss'}),
            winston.format.errors({stack: true}),
            winston.format.splat(),
            winston.format.json(),
        ),
        transports: PROD ? transportsProduction : transportsDev
    });
}

const accessDailyTransport = new winston.transports.DailyRotateFile({
    filename: 'data/logs/access-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info'
});
const accessTransportsProduction = [
    accessDailyTransport
];
const accessTransportsDev = [
    accessDailyTransport,
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.printf(info => `${info.timestamp} ACCESS: ${info.message.replaceAll('\n','')}` + (info.splat !== undefined ? `${info.splat}` : " ")),
        )
    })
];

export function getAccessLogger(PROD) {
    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp({format: 'YYY-MM-DD HH:mm:ss'}),
            winston.format.printf(info => `${info.timestamp} ACCESS: ${info.message.replaceAll('\n','')}` + (info.splat !== undefined ? `${info.splat}` : " ")),
        ),
        transports: PROD ? accessTransportsProduction : accessTransportsDev
    });
}