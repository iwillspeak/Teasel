/**
 * Syntax Kind
 *
 * Syntax kinds are opaque markers used to indiciate the type of a node or token
 * in the concrete syntax tree of red and green nodes. It is up to the higher
 * level 'typed' AST to give these kinds meanings.
 */
export type SyntaxKind = number;

/**
 * Text range of an item. This is a pair of offsets representing the start and
 * end of an element in the source text as UTF-16 code unit indicies.
 */
export interface Range {
  start: number;
  end: number;
}
