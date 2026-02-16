/** Ensures div, p, span, etc. are recognized in this folder when React types don't load. */
declare namespace JSX {
  interface IntrinsicElements {
    [tagName: string]: Record<string, unknown>;
  }
}
