import {RedNode} from '@iwillspeak/pyracantha';
import {Range} from '@iwillspeak/pyracantha';

/**
 * Base class for all syntax nodes.
 */
export class SyntaxItem {
  protected syntax: RedNode;

  /**
   * Construct a syntax item from the given `syntax` node.
   *
   * @param {RedNode} syntax The node for this item.
   */
  public constructor(syntax: RedNode) {
    this.syntax = syntax;
  }

  /**
   * Get the raw syntax node for this item.
   *
   * @internal
   */
  public get __rawSyntax(): RedNode {
    return this.syntax;
  }

  /**
   * Get the text span that this node represents. */
  public get range(): Range {
    return this.syntax.range;
  }

  /**
   * Convert the element back to a string.
   *
   * @return {string} A string representation of the underlying syntax.
   */
  public toString(): string {
    return this.syntax.toString();
  }
}
