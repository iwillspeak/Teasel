import {RedNode} from './pyracantha/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {DocumentFragmentSyntax} from './DocumentFragmentSyntax.js';
import {DoctypeSyntax} from './DoctypeSyntax.js';

/**
 * Syntax element for an HTML document.
 */

export class DocumentSyntax extends DocumentFragmentSyntax {
  public constructor(syntax: RedNode) {
    super(syntax);
  }

  /**
   * Get the DOCTYPE node for this document.
   */
  public get doctype(): DoctypeSyntax | null {
    for (const child of this.syntax.children()) {
      const docType = DoctypeSyntax.cast(child);
      if (docType) {
        return docType;
      }
    }
    return null;
  }

  /**
   * Cast a raw node to the strongly typed syntax.
   *
   * @param node The node to cast
   * @returns The casted node, or null if the cast coiuld not be made.
   */
  public static cast(node: RedNode): DocumentSyntax | null {
    if (node.kind == SyntaxKinds.Document) {
      return new DocumentSyntax(node);
    }

    return null;
  }
}
