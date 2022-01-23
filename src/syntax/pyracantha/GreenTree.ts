import {SyntaxKind} from './Syntax';

/**
 * # Green Node
 *
 * Nodes in the green tree have a kind and a colleciton of children. Green tree
 * nodes represent a specific piece of syntax without any specific location
 * information. Green nodes are intended to be cheap to build, and should
 * enable sharing of portions of the syntax tree.
 */
export class GreenNode {
  /**
   * The node's kind.
   */
  public kind: number;

  /**
   * The children of this node.
   */
  public children: GreenElement[];

  /**
   * The width of this node. This is cached based on the width of the node's
   * children
   */
  public width: number;

  /**
   * # Create a Green Node
   *
   * Green nodes can be built using this constructor to manually produce syntax.
   * For ergonomics however it is best to use a green tree builder instead.
   *
   * @param kind The kind for this node
   * @param children The children of this node
   */
  public constructor(kind: SyntaxKind, children: GreenElement[]) {
    this.kind = kind;
    this.children = children;
    this.width = children.reduce(
      (prev, current) => prev + current.textLength,
      0
    );
  }

  /**
   * The length of this node in the underlying source text. This is the width
   * of the node _inclusive_ of its children.
   */
  public get textLength(): number {
    return this.width;
  }
}

/**
 * # Green Tree Token
 *
 * Green tokens are the leaf nodes in the green tree. Each one represents a
 * fine-grained atom of syntax. Tokens _may_ correspond to tokens from the
 * lexical analysis phase, or may be composites of several lexical tokens.
 */
export class GreenToken {
  public kind: number;
  public text: string;

  /**
   * # Create a Green Token
   *
   * Green tokens can be manually created, but it is best to use a green tree
   * builder to allow for caching of nodes and tokens.
   *
   * @param kind The kind for this token
   * @param text The text of this token
   */
  public constructor(kind: SyntaxKind, text: string) {
    this.kind = kind;
    this.text = text;
  }

  /**
   * Get the length of this token in the underlying source text. This is the
   * length of the text that makes up this token.
   */
  public get textLength(): number {
    return this.text.length;
  }
}

/**
 * Element in the green tree. Either a node or a token.
 */
export type GreenElement = GreenNode | GreenToken;
