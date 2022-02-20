import {RedNode} from './pyracantha/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {SyntaxNode} from './ElementSyntax.js';

/**
 * Syntax element for an HTML Fragment
 */

export class DocumentFragmentSyntax extends SyntaxNode {
  public constructor(syntax: RedNode) {
    super(syntax);
  }

  public static cast(node: RedNode): DocumentFragmentSyntax | null {
    if (node.kind == SyntaxKinds.Document) {
      return new DocumentFragmentSyntax(node);
    }

    return null;
  }
}
