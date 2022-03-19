import {GreenNode} from './GreenNode.js';
import {SyntaxKind, Range} from './Pyracantha.js';
import {RedToken} from './RedToken.js';

/**
 * # Red Node
 *
 * Red nodes are the interior elements in the red tree. Each red node is a thin
 * wrapper around a green node and provides absolute position information.
 *
 * A red node knows its absolute offset from the start of the source text. It
 * lazily produces red elements to wrap the children of its {@link GreenNode}.
 */
export class RedNode {
  private parent: RedNode | null;
  private offset: number;
  private green: GreenNode;

  /**
   * Create a red node.
   *
   * Red nodes shouldn't be constructed directly. Instead red nodes can be
   * traversed from a parent node.
   *
   * @param parent The parent of this node.
   * @param offset The offset of this node from the start of the source text.
   * @param green The green node that backs this red node.
   */
  public constructor(parent: RedNode | null, offset: number, green: GreenNode) {
    this.parent = parent;
    this.offset = offset;
    this.green = green;
  }

  /**
   * Create a red tree from a given root.
   *
   * Initialises a new red tree rooted at the given green node.
   *
   * @param node The root node of the tree.
   * @return A new red tree for the given root.
   */
  public static createRoot(node: GreenNode): RedNode {
    return new RedNode(null, 0, node);
  }

  /**
   * Get the kind of this node. This is the kind of the underlying green node.
   */
  public get kind(): SyntaxKind {
    return this.green.kind;
  }

  /**
   * Get the text range of this node. This encompases all the children of this
   * node.
   */
  public get range(): Range {
    return {start: this.offset, end: this.green.textLength + this.offset};
  }

  /**
   * Get an iterator over the child elements of this node.
   */
  public *childrenWithTokens(): IterableIterator<RedNode | RedToken> {
    let index = this.offset;
    for (const child of this.green.children) {
      if (child instanceof GreenNode) {
        yield new RedNode(this, index, child);
      } else {
        yield new RedToken(this, index, child);
      }
      index += child.textLength;
    }
  }

  /**
   * Get an interator over the child nodes of this node. This iterator filters
   * out any tokens.
   */
  public *children(): IterableIterator<RedNode> {
    for (const child of this.childrenWithTokens()) {
      if (child instanceof RedNode) {
        yield child;
      }
    }
  }

  /**
   * Iterate over a filtered set of the node's children.
   *
   * @param kind The kind to filter.
   */
  public *childrenOfKind(kind: SyntaxKind): IterableIterator<RedNode> {
    for (const child of this.children()) {
      if (child.kind === kind) {
        yield child;
      }
    }
  }

  /**
   * Convert to Display String.
   *
   * @return The source text represented by the underlying green node.
   */
  public toString(): string {
    return this.green.toString();
  }
}
