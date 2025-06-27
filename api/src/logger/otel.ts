// const process = require('process');
// import { NodeSDK } from '@opentelemetry/sdk-node';
// import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
// import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
// import {
//     PeriodicExportingMetricReader,
//     ConsoleMetricExporter,
// } from '@opentelemetry/sdk-metrics';

// import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// // For troubleshooting, set the log level to DiagLogLevel.DEBUG
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

// const sdk = new NodeSDK({
//     // traceExporter: new ConsoleSpanExporter(),
//     // metricReader: new PeriodicExportingMetricReader({
//     //     exporter: new ConsoleMetricExporter(),
//     // }),
//     instrumentations: [getNodeAutoInstrumentations()],
// });

// try {
//     sdk.start();
//     console.log('✅ OpenTelemetry SDK started');
// } catch (error) {
//     console.error('❌ Error starting OpenTelemetry SDK', error);
// }

// // gracefully shut down the SDK on process exit
// process.on('SIGTERM', () => {
//     sdk.shutdown()
//         .then(() => console.log('Tracing terminated'))
//         .catch((error) => console.log('Error terminating tracing', error))
//         .finally(() => process.exit(0));
// });