FROM node:18-slim

ENV RUNNING_ON_CONTAINER=true
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://signoz-otel-collector.platform.svc.cluster.local:4318
ENV OTEL_SERVICE_NAME=project-c
ENV OTEL_SERVICE_VERSION=1.0.0
ENV OTEL_LOG_LEVEL=info

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD node --require ./instrumentation.js index.js
