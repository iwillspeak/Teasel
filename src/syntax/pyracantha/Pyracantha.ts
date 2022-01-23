/**
 * Syntax Kind
 *
 * Syntax kinds are opaque markers used to indiciate the type of a node or token
 * in the concrete syntax tree of red and green nodes. It is up to the higher
 * level 'typed' AST to give these kinds meanings.
 */
export type SyntaxKind = number;
