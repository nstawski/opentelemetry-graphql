const { ApolloServer, gql } = require("apollo-server");
const { parse } = require("flatted");

// Setting up OpenTelemetry
const opentelemetry = require("@opentelemetry/core");
const { BasicTracer, BatchSpanProcessor } = require("@opentelemetry/tracing");
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
const { trace } = require("console");

const tracer = new BasicTracer();
const exporterConfig = {
  serviceName: "graphql-backend",
};

// setup the exporter
const exporter = new ZipkinExporter(exporterConfig);

// configure span processor to send spans to the provided exporter
tracer.addSpanProcessor(new BatchSpanProcessor(exporter));

// initialize the OpenTelemetry APIs to use the BasicTracer bindings
opentelemetry.initGlobalTracer(tracer);

const startSpan = (name, attributes, parent, eventName) => {
  let span = parent
    ? tracer.startSpan(name, {
        parent,
        attributes,
        traceId: attributes.traceId,
      })
    : tracer.startSpan(name, { attributes, traceId: attributes.traceId });

  if (eventName) {
    span.addEvent(eventName);
  }

  span.end();

  return span;
};

const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

const books = [
  {
    title: "The Hobbit",
    author: "J.R.R.Tolkien",
  },
  {
    title: "Brave New World",
    author: "Aldous Hucksley",
  },
];

const resolvers = {
  Query: {
    books: () => books,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const currentSpans = req.headers["graphql-current-spans"] || "";
    const parsedSpans = parse(currentSpans);
    const spanAttributes =
      parsedSpans.length && parsedSpans[0]
        ? {
            traceId: parsedSpans[0].spanContext.traceId,
            parentId: parsedSpans[0].parentSpanId,
            service: "GraphQL",
          }
        : {};
    startSpan("GraphQL request", spanAttributes, parsedSpans[0]);

    return { parsedSpans };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
