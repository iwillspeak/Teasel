import {GreenElement} from './GreenTree.js';
import {GreenNode} from './GreenNode.js';
import {SyntaxKind} from './Pyracantha.js';
import {NodeCache} from './NodeCache.js';

interface Mark {
  children: GreenElement[];
}

/**
 * Green Tree Builder
 *
 * Used to build up a piece of syntax piece by piece. Tokens are added with the
 * {@link GreenTreeBuilder.token} method. Nodes can be built in two ways:
 *
 *  * The standard API of calling {@link GreenTreeBuilder.startNode} and
 *    {@link GreenTreeBuilder.finishNode} when the node is entered and left.
 *
 *  * The 'mark' API by calling {@link GreenTreeBuilder.mark} to store a mark
 *    and then _optionally_ calling {@link GreenTreeBuilder.applyMark} later to
 *    retroactively build the node.
 */
export class GreenTreeBuilder {
  /**
   * The stack of current nodes being built. Each element is a pair of the node
   * kind for the node at that level, and the cached children from the parent
   * node to be applied when the node is popped.
   */
  private nodes: Array<[SyntaxKind, GreenElement[]]> = [];

  /**
   * Children for the current node being built.
   */
  private children: GreenElement[] = [];

  /**
   * The node cache to use when creating tokens and nodes.
   */
  private nodeCache: NodeCache;

  /**
   * Create a new tree builder, using the given node cache if provided.
   */
  public constructor(cache: NodeCache | number | undefined = undefined) {
    if (cache instanceof NodeCache) {
      this.nodeCache = cache;
    } else {
      this.nodeCache = new NodeCache(cache);
    }
  }

  /**
   * Start building a new child node of the given {@link kind}.
   *
   * @param kind The kind of node to start.
   */
  public startNode(kind: SyntaxKind): void {
    this.nodes.push([kind, this.children]);
    this.children = [];
  }

  /**
   * Finish building the current node. This takes the current cached children,
   * wraps them in a new node, and restores the cildren from the previous
   * outer node.
   */
  public finishNode(): void {
    const pair = this.nodes.pop();

    if (pair === undefined) {
      throw new Error('Unbalanced call to finishNode');
    }

    const [kind, outerChildren] = pair;

    outerChildren.push(this.nodeCache.createNode(kind, this.children));

    this.children = outerChildren;
  }

  /**
   * Store a mark to later optionally turn into a node.
   *
   * @returns A new mark to the current bulder position.
   */
  public mark(): Mark {
    return {
      children: this.children
    };
  }

  /**
   * Convert a cached mark into a new node.
   *
   * @param mark The mark to apply.
   * @param kind The node kind to create.
   */

  public applyMark(mark: Mark, kind: SyntaxKind): void {
    const markLen = mark.children.length;
    const ourLen = this.children.length;

    if (ourLen < markLen) {
      throw new Error('Mark has expired. State has unwound past mark.');
    }

    // TODO (jg): ensure these slices are actually right for what was
    // intended
    const ourChildren = this.children.slice(0, ourLen - markLen);
    const bufferedChildren = this.children.slice(ourLen - markLen);

    // TODO (jg): check this equality check is enough
    if (!bufferedChildren.every((child, idx) => mark.children[idx] === child)) {
      throw new Error('Mark has expired. Child state does not match.');
    }

    const node = this.nodeCache.createNode(kind, ourChildren);

    this.children = [node, ...bufferedChildren];
  }

  /**
   * Emit a token in the tree of the given kind.
   *
   * @param kind The token kind to emit.
   * @param text The text / lexeme of the token.
   */
  public token(kind: SyntaxKind, text: string): void {
    this.children.push(this.nodeCache.createToken(kind, text));
  }

  /**
   * Finish building the tree by creating a root node of the given kind.
   * @param kind The root node kind
   * @returns A new syntax tree root node.
   */
  public buildRoot(kind: SyntaxKind): GreenNode {
    if (this.nodes.length !== 0) {
      throw new Error(`Expected empty stack. Found ${this.nodes}`);
    }

    return this.nodeCache.createNode(kind, this.children);
  }
}
