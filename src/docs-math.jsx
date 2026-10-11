import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Expressions are authored locally, never read from model or user input.
export function MathExpression({ children, display = false }) {
  const html = katex.renderToString(children, {
    displayMode: display, output: 'htmlAndMathml', throwOnError: true, trust: false,
  });
  return display
    ? <div className="doc-equation" tabIndex={0} role="region" aria-label="Equation" dangerouslySetInnerHTML={{ __html: html }} />
    : <span className="doc-inline-math" dangerouslySetInnerHTML={{ __html: html }} />;
}
