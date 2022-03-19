import {GreenElement} from './GreenTree.js';
import {GreenNode} from './GreenNode.js';
import {SyntaxKind} from './Pyracantha.js';
import {NodeCache} from './NodeCache.js';

/**
 * Mark in the Tree Builder.
 *
 * These are returned from the `mark` API and represent cursors into the
 * builder. Marks can be used to speculatively build nodes rather than using
 * the main `startNode`/`finishNode` API.
 */
interface Mark {
  index: number;
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
  private nodes: Array<[SyntaxKind, GreenElement[], Mark[]]> = [];

  /**
   * Children for the current node being built.
   */
  private children: GreenElement[] = [];

  /**
   * Open marks at the current level
   */
  private marks: Mark[] = [];

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
    this.nodes.push([kind, this.children, this.marks]);
    this.children = [];
    this.marks = [];
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

    const [kind, outerChildren, outerMarks] = pair;

    outerChildren.push(this.nodeCache.createNode(kind, this.children));

    this.children = outerChildren;
    this.marks = outerMarks;
  }

  /**
   * Store a mark to later optionally turn into a node.
   *
   * @return A new mark to the current bulder position.
   */
  public mark(): Mark {
    const index = this.children.length;
    const mark = {
      index: index
    };
    this.marks.push(mark);
    return mark;
  }

  /**
   * Convert a cached mark into a new node.
   *
   * @param mark The mark to apply.
   * @param kind The node kind to create.
   */
  public applyMark(mark: Mark, kind: SyntaxKind): void {
    const markedChildren = this.sliceOffMark(mark);
    this.children.push(this.nodeCache.createNode(kind, markedChildren));
  }

  /**
   * Slice off the children after the given mark.
   *
   * @param mark The mark to slice.
   * @return The elements of the current node that are _after_ the given mark.
   */
  public sliceOffMark(mark: Mark): GreenElement[] {
    const markIndex = this.marks.indexOf(mark);
    if (markIndex < 0) {
      throw new Error('Mark is not applicable to this node.');
    }

    if (mark.index > this.children.length) {
      throw new Error('Mark has expired. Child state does not match.');
    }

    // Clear out marks that are no longer applicable.
    const expiredIndex = this.marks.findIndex((m) => {
      return m.index > mark.index;
    });
    if (expiredIndex > 0) {
      this.marks = this.marks.slice(0, expiredIndex);
    }

    const markedChildren = this.children.slice(mark.index);
    this.children = this.children.slice(0, mark.index);
    return markedChildren;
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
   * Emit a given sequence of elements into the tree.
   *
   * @param elements The elements to buffer.
   */
  public elements(elements: GreenElement[]): void {
    for (const element of elements) {
      this.children.push(element);
    }
  }

  /**
   * Finish building the tree by creating a root node of the given kind.
   * @param kind The root node kind
   * @return A new syntax tree root node.
   */
  public buildRoot(kind: SyntaxKind): GreenNode {
    if (this.nodes.length !== 0) {
      throw new Error(`Expected empty stack. Found ${this.nodes}`);
    }

    return this.nodeCache.createNode(kind, this.children);
  }
}
