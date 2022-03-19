import {RedNode} from './pyracantha/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {RedToken} from './pyracantha/RedToken.js';
import {SyntaxItem} from './SyntaxItem.js';
import {nthOfKind} from './Syntax.js';
import {AttributeValueSyntax} from './AttributeValueSyntax.js';

/**
 * Syntax elemnet for an HTML document's DOCTYPE declration.
 *
 * Provides a strucutred way to intract with syntax nodes representing a
 * `<!doctype ..` element.
 */
export class DoctypeSyntax extends SyntaxItem {
  /**
   * interpret the given node as a doctype element.
   *
   * @param {RedNode} syntax The node to wrap as a doctype syntax.
   */
  public constructor(syntax: RedNode) {
    super(syntax);
  }

  /**
   * Get the name of the DOCTYPE element. e.g. `html`.
   */
  public get name(): string | null {
    const child = nthOfKind(
      this.syntax.childrenWithTokens(),
      SyntaxKinds.Ident,
      2
    );
    if (child instanceof RedToken) {
      return child.text;
    }

    return null;
  }

  /**
   * Get the keyword, if any, from the DOCTYPE element. e.g. PUBLIC.
   */
  public get keyword(): string | null {
    const child = nthOfKind(
      this.syntax.childrenWithTokens(),
      SyntaxKinds.Ident,
      3
    );
    if (child instanceof RedToken) {
      return child.text;
    }

    return null;
  }

  /**
   * Get the public identifier from the DOCTYPE element, if any.
   */
  public get publicIdentifier(): AttributeValueSyntax | null {
    if (this.keyword !== 'PUBLIC') {
      return null;
    }

    const child = nthOfKind(
      this.syntax.children(),
      SyntaxKinds.AttributeValue,
      1
    );
    if (child !== null) {
      return AttributeValueSyntax.cast(child);
    }

    return null;
  }

  /**
   * Get the system identifier from the DOCTYPE element, if any.
   */
  public get systemIdentifier(): AttributeValueSyntax | null {
    const offset = this.keyword === 'SYSTEM' ? 1 : 2;

    const child = nthOfKind(
      this.syntax.children(),
      SyntaxKinds.AttributeValue,
      offset
    );
    if (child !== null) {
      return AttributeValueSyntax.cast(child);
    }

    return null;
  }

  /**
   * Try and cast a node as a doctype element.
   *
   * @param {RedNode} node The syntax node to cast.
   * @return {DoctypeSyntax | null} The DoctypeSyntax if the node is a Doctype,
   *                                or null otherwise.
   */
  public static cast(node: RedNode): DoctypeSyntax | null {
    if (node.kind === SyntaxKinds.Doctype) {
      return new DoctypeSyntax(node);
    }

    return null;
  }
}
