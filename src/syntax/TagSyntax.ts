import {RedNode} from './pyracantha/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {RedToken} from './pyracantha/RedToken.js';
import {SyntaxItem} from './SyntaxItem.js';
import {nthOfKind} from './Syntax.js';

/**
 * Element tag.
 */

export class TagSyntax extends SyntaxItem {
  public constructor(syntax: RedNode) {
    super(syntax);
  }

  /**
   * Get the name of the tag, if one was provided.
   */
  public get name(): string | null {
    const found = nthOfKind(
      this.syntax.childrenWithTokens(),
      SyntaxKinds.Ident,
      1
    );
    if (found instanceof RedToken) {
      return found.text;
    }

    return null;
  }
}
