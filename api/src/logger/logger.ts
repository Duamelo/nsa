import { createLogger, format, transports } from 'winston';
import { context, trace } from '@opentelemetry/api';
import path from 'path';

const { combine, timestamp, errors, json } = format;

// Injecte traceId/spanId d'OpenTelemetry dans chaque log
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
        json() // Format JSON propre
    ),
    transports: [
        new transports.File({
            filename: path.join(__dirname, '../../logs/app.log'),
            level: 'info',
            maxsize: 5_000_000, // 5 Mo par fichier
            maxFiles: 5, // Garder les 5 derniers
        }),
    ],
});

export default logger;
