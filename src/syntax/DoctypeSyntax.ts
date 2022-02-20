import {RedNode} from './pyracantha/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {RedToken} from './pyracantha/RedToken.js';
import {SyntaxItem} from './SyntaxItem.js';
import {nthOfKind} from './Syntax.js';
import {AttributeValueSyntax} from './AttributeValueSyntax.js';

/**
 * Syntax elemnet for an HTML document's DOCTYPE declration.
 */

export class DoctypeSyntax extends SyntaxItem {
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
   * Cast a raw node to the strongly typed syntax.
   *
   * @param node The node to cast
   * @returns The casted node, or null if the cast coiuld not be made.
   */
  public static cast(node: RedNode): DoctypeSyntax | null {
    if (node.kind === SyntaxKinds.Doctype) {
      return new DoctypeSyntax(node);
    }

    return null;
  }
}
