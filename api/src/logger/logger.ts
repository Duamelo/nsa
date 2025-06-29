import { createLogger, format, transports } from 'winston';
import path from 'path';

const { combine, timestamp, errors, json } = format;


const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        errors({ stack: true }),
        json() // Format JSON propre
    ),
    transports: [
        new transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            level: 'info',
            maxsize: 5_000_000, // 5 Mo par fichier
            maxFiles: 5, // Garder les 5 derniers
        }),
    ],
});

export default logger;
