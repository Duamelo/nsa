// src/middleware/logRequest.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';

export const logRequest = (req: Request, res: Response, next: NextFunction): void => {
    const start = process.hrtime(); // Pour mesurer le temps de réponse

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const durationMs = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2); // en ms

        logger.info({
            message: 'HTTP Request',
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            durationMs: parseFloat(durationMs),
        });
    });

    next();
};
