import {RedNode} from '@iwillspeak/pyracantha';
import {SyntaxKinds} from '../parse/Parser.js';
import {RedToken} from '@iwillspeak/pyracantha';
import {SyntaxItem} from './SyntaxItem.js';
import {nthOfKind} from './Syntax.js';
import {ElementSyntax} from './ElementSyntax.js';

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
   * Get the containing element for this tag.
   */
  public get containingElement(): ElementSyntax | null {
    if (this.syntax.parent !== null) {
      return ElementSyntax.cast(this.syntax.parent);
    }

    return null;
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
