// src/middleware/logRequest.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../logger/logger';

const logRequest = (req: Request, res: Response, next: NextFunction): void => {
    logger.info({
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        query: req.query,
        timestamp: new Date().toISOString(),
    });

    next();
};

export default logRequest;
