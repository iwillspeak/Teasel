import {SyntaxKind} from './Pyracantha';
import {GreenToken} from './GreenToken';

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
  public children: Array<GreenNode | GreenToken>;

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
  public constructor(
    kind: SyntaxKind,
    children: Array<GreenNode | GreenToken>
  ) {
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
