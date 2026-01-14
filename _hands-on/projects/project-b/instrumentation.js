function initializeOpenTelemetry() {
  const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

  const {
    getNodeAutoInstrumentations,
  } = require('@opentelemetry/auto-instrumentations-node');
  const {
    OTLPTraceExporter,
  } = require('@opentelemetry/exporter-trace-otlp-http');
  const { resourceFromAttributes } = require('@opentelemetry/resources');
  const {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
  } = require('@opentelemetry/semantic-conventions');
  const { NodeSDK } = require('@opentelemetry/sdk-node');
  const {
    OTLPMetricExporter,
  } = require('@opentelemetry/exporter-metrics-otlp-http');
  const {
    PeriodicExportingMetricReader,
  } = require('@opentelemetry/sdk-metrics');

  const COLLECTOR_STRING = `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`;
  const METRICS_COLLECTOR_STRING = `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`;
  const appStage = !!process.env.OTEL_SERVICE_NAME
    ? process.env.STAGE
    : 'local';

  const traceExporter = new OTLPTraceExporter({ url: COLLECTOR_STRING });
  const metricExporter = new OTLPMetricExporter({
    url: METRICS_COLLECTOR_STRING,
  });
  
  const sdk = new NodeSDK({
    traceExporter,
    
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
        '@opentelemetry/instrumentation-pg': { enabled: true, enhancedDatabaseReporting: true },
      }),
    ],

    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 60000,
    }),
    
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]:
        process.env.OTEL_SERVICE_NAME || `project-b-${appStage}`,
      [ATTR_SERVICE_VERSION]: '1.0.0',
    }),
  });

  // gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error));
  });

  // gracefully shut down the SDK on process exit
  process.on('SIGINT', () => {
    sdk
      .shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error));
  });

  sdk.start();
  console.log('OpenTelemetry SDK started');
}

if (
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT &&
  process.env.RUNNING_ON_CONTAINER == 'true'
) {
  initializeOpenTelemetry();
} else {
  console.log(
    'OpenTelemetry tracing is disabled because the OTEL_EXPORTER_OTLP_ENDPOINT environment variable is not set or RUNNING_ON_CONTAINER is not set to true.',
  );
}
