import {RedNode} from './pyracantha/RedNode.js';
import {Range} from './pyracantha/Pyracantha.js';

/**
 * Base class for all syntax nodes.
 */
export class SyntaxItem {
  protected syntax: RedNode;

  public constructor(syntax: RedNode) {
    this.syntax = syntax;
  }

  /**
   * Get the text span that this node represents. */
  public get range(): Range {
    return this.syntax.range;
  }

  /**
   * Convert the element back to a string.
   */
  public toString(): string {
    return this.syntax.toString();
  }
}
