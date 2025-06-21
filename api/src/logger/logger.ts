// src/logger/logger.ts
import { createLogger, format, transports } from 'winston';
import { context, trace } from '@opentelemetry/api';

const { combine, timestamp, errors, json } = format;

// Ajoute traceId & spanId si disponibles
const addTraceContext = format((info) => {
    const span = trace.getSpan(context.active());
    if (span) {
        const spanContext = span.spanContext();
        info.trace_id = spanContext.traceId;
        info.span_id = spanContext.spanId;
    }
    return info;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        errors({ stack: true }),
        addTraceContext(),
        json()
    ),
    transports: [
        new transports.Console()
    ]
});

export default logger;
