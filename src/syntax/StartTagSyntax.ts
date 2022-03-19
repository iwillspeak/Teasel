import {RedNode} from './pyracantha/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {TagSyntax} from './TagSyntax.js';
import {AttributeSyntax} from './AttributeSyntax.js';

/**
 * Element start tag
 */
export class StartTagSyntax extends TagSyntax {
  /**
   * Create a tag syntax for the given node.
   *
   * @param {RedNode} syntax The node to wrap.
   */
  public constructor(syntax: RedNode) {
    super(syntax);
  }

  /**
   * Iterator over the attributes on this tag.
   */
  public *attributes(): IterableIterator<AttributeSyntax> {
    for (const child of this.syntax.childrenOfKind(SyntaxKinds.Attribute)) {
      const attr = AttributeSyntax.cast(child);
      if (attr !== null) {
        yield attr;
      }
    }
  }
}
