import {RedNode} from '@iwillspeak/pyracantha/lib/red/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {RedToken} from '@iwillspeak/pyracantha/lib/red/RedToken.js';
import {SyntaxItem} from './SyntaxItem.js';
import {nthOfKind} from './Syntax.js';

/**
 * Element tag.
 */
export class TagSyntax extends SyntaxItem {
  /**
   * Create a tag syntax for the given node.
   *
   * @param {RedNode} syntax The syntax node to wrap.
   */
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
