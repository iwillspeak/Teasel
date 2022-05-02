import {RedNode} from '@iwillspeak/pyracantha/lib/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {DocumentFragmentSyntax} from './DocumentFragmentSyntax.js';
import {DoctypeSyntax} from './DoctypeSyntax.js';

/**
 * Syntax element for an HTML document.
 *
 * This is the root of a syntx tree for a fully-fledged HTML document, complete
 * with {@link doctype}.
 */
export class DocumentSyntax extends DocumentFragmentSyntax {
  /**
   * Create a new Document Syntax
   *
   * Initialises a document syntax with the given `syntax` as the root. The node
   * should be of type {@link SyntaxKinds.Document}. It is recommended to call
   * {@link cast} rather than construct an instance directly.
   *
   * @param {RedNodes} syntax The node to interpret as a document syntax.
   */
  public constructor(syntax: RedNode) {
    super(syntax);
  }

  /**
   * Get the DOCTYPE node for this document, if any.
   *
   * @return {DoctypeSyntax | null} The doctype, or null if missing.
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
   * Try and cast a node as a document syntax.
   *
   * @param {RedNode} node The syntax node to cast.
   * @return {DocumentSyntax | null} The DocumentSyntax if the node is a
   *                                  Document, or null otherwise.
   */
  public static cast(node: RedNode): DocumentSyntax | null {
    if (node.kind == SyntaxKinds.Document) {
      return new DocumentSyntax(node);
    }

    return null;
  }
}
