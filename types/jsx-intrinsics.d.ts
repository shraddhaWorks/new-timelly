/**
 * Fallback so JSX intrinsic elements (div, p, span, etc.) are always recognized.
 * Fixes "Property 'div' does not exist on type 'JSX.IntrinsicElements'" when React types don't load in the IDE.
 */
declare namespace JSX {
  interface IntrinsicElements {
    [tagName: string]: Record<string, unknown>;
  }
}
