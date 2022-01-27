import {RedNode} from './RedNode';
import {SyntaxKind, Range} from './Pyracantha';
import {GreenToken} from './GreenToken';

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
   * Get the text of the underlying token.
   */
  public get text(): string {
    return this.green.text;
  }

  /**
   * Get the range of this element. This is the range covered by the text of the
   * underlying token.
   */
  public get range(): Range {
    return {start: this.offset, end: this.green.textLength + this.offset};
  }
}
