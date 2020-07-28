import * as opentelemetry from "@opentelemetry/core";
import {
  BasicTracer,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/tracing";
import { Span } from "@opentelemetry/types";
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";

export type SpanAttributes = {
  [key: string]: any;
  buttonID: string;
  event: string;
  parent?: Span;
};

export const useTelemetry = () => {
  // create a tracer
  const tracer = new BasicTracer();

  const exporterConfig = {
    serviceName: "react-ui",
  };

  // setup the exporter
  const exporter = new InMemorySpanExporter();

  const zipkinExporter = new ZipkinExporter(exporterConfig);

  // configure span processor to send spans to the provided exporter
  tracer.addSpanProcessor(new SimpleSpanProcessor(exporter));
  tracer.addSpanProcessor(new SimpleSpanProcessor(zipkinExporter));

  // initialize the OpenTelemetry APIs to use the BasicTracer bindings
  opentelemetry.initGlobalTracer(tracer);

  const startSpan = (
    name: string,
    attributes: SpanAttributes,
    parent?: Span,
    eventName?: string
  ) => {
    let span: Span = parent
      ? tracer.startSpan(name, { parent, attributes })
      : tracer.startSpan(name, { attributes });

    if (eventName) {
      span.addEvent(eventName);
    }

    span.end();

    return span;
  };

  const getFinishedSpans = () => exporter.getFinishedSpans();

  return {
    startSpan,
    getFinishedSpans,
  };
};
