import {GreenNode, GreenToken} from './GreenTree';
import {SyntaxKind} from './Syntax';

/**
 * Element in the red tree. Either a {@link RedNode} or {@link RedToken}.
 */
export type RedElement = RedNode | RedToken;

/**
 * Text range of an item. This is a pair of offsets representing the start and
 * end of an element in the source text as UTF-16 code unit indicies.
 */
export interface Range {
  start: number;
  end: number;
}

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
   * @returns A new red tree for the given root.
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
  public *childrenWithTokens(): IterableIterator<RedElement> {
    var index = this.offset;
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
}

/**
 * A leaf node in the red tree. This wraps an underlying {@link GreenToken}.
 */
export class RedToken {
  private parent: RedNode | null;
  private offset: number;
  private green: GreenToken;

  /**
   * Create a red token.
   *
   * Red tokens should not need to be constructed manually, instead they are
   * produced on demand when traversing a red node.
   *
   * @param parent The parent node for this token.
   * @param offset The offset of this token from the start of the source text.
   * @param green The underlying {@link GreenToken}.
   */
  public constructor(parent: RedNode, offset: number, green: GreenToken) {
    this.parent = parent;
    this.offset = offset;
    this.green = green;
  }

  /**
   * Get the kind of this element. This is the kind of the underlying token.
   */
  public get kind(): SyntaxKind {
    return this.green.kind;
  }

  /**
   * Get the range of this element. This is the range covered by the text of the
   * underlying token.
   */
  public get range(): Range {
    return {start: this.offset, end: this.green.textLength + this.offset};
  }
}
