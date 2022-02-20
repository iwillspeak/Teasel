import {RedNode} from './pyracantha/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {RedToken} from './pyracantha/RedToken.js';
import {SyntaxItem} from './SyntaxItem.js';
import {nthOfKind} from './Syntax.js';

/**
 * Attribute value. This could be attached to an attribute in a tag, or part
 * of the DOCTYPE declaration.
 */

export class AttributeValueSyntax extends SyntaxItem {
  public constructor(syntax: RedNode) {
    super(syntax);
  }

  /**
   * The text value of the attribute.
   */
  public get text(): string | null {
    const child = nthOfKind(
      this.syntax.childrenWithTokens(),
      SyntaxKinds.Text,
      1
    );
    if (child instanceof RedToken) {
      return child.text;
    }

    return null;
  }

  /**
   * Cast a raw node to the strongly typed syntax.
   *
   * @param node The node to cast
   * @returns The casted node, or null if the cast coiuld not be made.
   */
  public static cast(node: RedNode): AttributeValueSyntax | null {
    if (node.kind === SyntaxKinds.AttributeValue) {
      return new AttributeValueSyntax(node);
    }

    return null;
  }
}
