import { stringify } from "flatted";
import React, { useState } from "react";
import { Span } from "@opentelemetry/types";

import "./App.css";
import { useTelemetry, SpanAttributes } from "./components/useTelemetry";
import { useGraphQL } from "./useGraphQL";

export const App = () => {
  const { startSpan, getFinishedSpans } = useTelemetry();
  const [currentParent, setCurrentParent] = useState<Span>();

  const { getBooks } = useGraphQL();

  const startButtonSpan = (button: string) => {
    const spanAttributes: SpanAttributes = {
      buttonID: button,
      event: "click",
    };

    const span = startSpan(`button-${button}`, spanAttributes, currentParent);

    if (!currentParent) {
      setCurrentParent(span);
    }
  };

  const fetchBooks = () => {
    const finishedSpans = stringify(getFinishedSpans());
    return getBooks(finishedSpans);
  };

  const buttons = Array.from({ length: 8 }, (v, k) => (k + 1).toString());

  return (
    <div className="App">
      <header className="App-header">
        {buttons.map((button) => (
          <button
            key={`button-${button}`}
            onClick={() => startButtonSpan(button)}
          >
            Button #{button}
          </button>
        ))}
        <button
          key="endParentSpan"
          onClick={() => setCurrentParent(undefined)}
          className="end"
        >
          End parent span
        </button>
        <button
          key="getFinishedSpans"
          onClick={() => fetchBooks()}
          className="end"
        >
          Get finished spans
        </button>
      </header>
    </div>
  );
};

export default App;
