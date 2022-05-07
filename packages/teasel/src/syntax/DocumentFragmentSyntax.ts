import {RedNode} from '@iwillspeak/pyracantha';
import {SyntaxKinds} from '../parse/Parser.js';
import {SyntaxNode} from './ElementSyntax.js';

/**
 * Syntax element for an HTML Fragment
 */
export class DocumentFragmentSyntax extends SyntaxNode {
  /**
   * Construct a new document fragment for the given node.
   *
   * @param {RedNode} syntax The node to wrap.
   */
  public constructor(syntax: RedNode) {
    super(syntax);
  }

  /**
   * Try to cast the given node as a document fragment.
   *
   * @param {RedNode} node The node to cast.
   * @return {DocumentFragmentSyntax | null} The node wrapped as a document
   *                                         fragment, if possible.
   */
  public static cast(node: RedNode): DocumentFragmentSyntax | null {
    if (node.kind == SyntaxKinds.Document) {
      return new DocumentFragmentSyntax(node);
    }

    return null;
  }
}
