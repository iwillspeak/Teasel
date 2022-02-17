import {SyntaxKind} from './Pyracantha.js';
import {GreenToken} from './GreenToken.js';
import {Djb} from './Djb.js';

/**
 * # Green Node
 *
 * Nodes in the green tree have a kind and a colleciton of children. Green tree
 * nodes represent a specific piece of syntax without any specific location
 * information. Green nodes are intended to be cheap to build, and should
 * enable sharing of portions of the syntax tree.
 */
export class GreenNode {
  private hashCode: number | undefined;

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
    public kind: SyntaxKind,
    public children: Array<GreenNode | GreenToken>
  ) {
    this.width = children.reduce(
      (prev, current) => prev + current.textLength,
      0
    );
    this.hashCode = undefined;
  }

  /**
   * Get the hash code for this element.
   */
  public get hash(): number {
    if (this.hashCode === undefined) {
      var hash = new Djb();
      hash.writeNumber(this.kind);
      for (var element of this.children) {
        hash.writeNumber(element.hash);
      }
      this.hashCode = hash.finish();
    }

    return this.hashCode;
  }

  /**
   * The length of this node in the underlying source text. This is the width
   * of the node _inclusive_ of its children.
   */
  public get textLength(): number {
    return this.width;
  }

  /**
   * Convert to Display String.
   *
   * @returns The source text represented by this node.
   */
  public toString(): string {
    let result = '';
    for (const child of this.children) {
      result += child.toString();
    }

    return result;
  }
}
