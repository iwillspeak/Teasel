import {RedNode} from './pyracantha/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {RedToken} from './pyracantha/RedToken.js';
import {SyntaxItem} from './SyntaxItem.js';
import {nthOfKind} from './Syntax.js';
import {AttributeValueSyntax} from './AttributeValueSyntax.js';

/**
 * Tag attribute
 */

export class AttributeSyntax extends SyntaxItem {
  public constructor(syntax: RedNode) {
    super(syntax);
  }

  /**
   * Get the name of the attribute.
   *
   * @returns The name of the attribute, if available.
   */
  public name(): string | null {
    const name = nthOfKind(
      this.syntax.childrenWithTokens(),
      SyntaxKinds.Ident,
      1
    );
    if (name instanceof RedToken) {
      return name.text;
    }

    return null;
  }

  /**
   * Get the value of the attribute.
   *
   * @returns The attribute value, if available.
   */
  public value(): AttributeValueSyntax | null {
    const value = nthOfKind(
      this.syntax.children(),
      SyntaxKinds.AttributeValue,
      1
    );

    if (value instanceof RedNode) {
      return AttributeValueSyntax.cast(value);
    }

    return null;
  }

  /**
   * Cast a raw node to the strongly typed syntax.
   *
   * @param node The node to cast
   * @returns The casted node, or null if the cast coiuld not be made.
   */
  public static cast(node: RedNode): AttributeSyntax | null {
    if (node.kind === SyntaxKinds.Attribute) {
      return new AttributeSyntax(node);
    }

    return null;
  }
}
