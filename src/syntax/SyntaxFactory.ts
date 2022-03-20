import {SyntaxKinds} from '../parse/Parser.js';
import {AttributeSyntax} from './AttributeSyntax.js';
import {AttributeValueSyntax} from './AttributeValueSyntax.js';
import {DoctypeSyntax} from './DoctypeSyntax.js';
import {GreenNode} from './pyracantha/GreenNode.js';
import {GreenToken} from './pyracantha/GreenToken.js';
import {GreenElement} from './pyracantha/GreenTree.js';
import {RedNode} from './pyracantha/RedNode.js';
import {StartTagSyntax} from './StartTagSyntax.js';
import {TagSyntax} from './TagSyntax.js';

/**
 * The type of quote to use when creating atttributes.
 */
export enum QuoteStyle {
  None,
  Single,
  Double
}

/**
 * Factory methods for syntax items.
 */
export class SyntaxFactory {
  /**
   * Create a new attribute syntax with the given attribute name and value.
   *
   * @param {string} name The attribute name.
   * @param {string | AttributeValueSyntax} [value] The attribute value.
   * @return {AttributeSyntax} The new attribute value.
   */
  public static attribute(
    name: string,
    value: string | AttributeValueSyntax | undefined = undefined
  ): AttributeSyntax {
    const body: GreenElement[] = [new GreenToken(SyntaxKinds.Ident, name)];

    if (value !== undefined) {
      body.push(new GreenToken(SyntaxKinds.Trivia, '='));
      if (value instanceof AttributeValueSyntax) {
        body.push(value.rawSyntax.rawItem);
      } else {
        body.push(
          new GreenNode(SyntaxKinds.AttributeValue, [
            new GreenToken(SyntaxKinds.Trivia, '"'),
            new GreenToken(SyntaxKinds.Text, value),
            new GreenToken(SyntaxKinds.Trivia, '"')
          ])
        );
      }
    }

    return new AttributeSyntax(
      new RedNode(null, 0, new GreenNode(SyntaxKinds.Attribute, body))
    );
  }

  /**
   * Create a new attribute value syntax with the given raw value.
   *
   * @param {string} value The value for the atttribute value.
   * @param {QuoteStyle} [quote] The type of quote  to use.
   * @return {AttributeValueSyntax} The new attribute value.
   */
  public static attributeValue(
    value: string,
    quote: QuoteStyle | undefined = undefined
  ): AttributeValueSyntax {
    const body = [new GreenToken(SyntaxKinds.Text, value)];

    if (quote == QuoteStyle.Single) {
      body.push(new GreenToken(SyntaxKinds.Trivia, "'"));
      body.unshift(new GreenToken(SyntaxKinds.Trivia, "'"));
    } else if (quote == QuoteStyle.Double) {
      body.push(new GreenToken(SyntaxKinds.Trivia, '"'));
      body.unshift(new GreenToken(SyntaxKinds.Trivia, '"'));
    }

    return new AttributeValueSyntax(
      new RedNode(null, 0, new GreenNode(SyntaxKinds.AttributeValue, body))
    );
  }

  /**
   * Create a new doctype syntax with the given document type.
   *
   * @param {string} kind The document kind.
   * @return {DoctypeSyntax} The new doctype syntax value.
   */
  public static doctype(kind: string): DoctypeSyntax {
    return new DoctypeSyntax(
      new RedNode(
        null,
        0,
        new GreenNode(SyntaxKinds.Doctype, [
          new GreenToken(SyntaxKinds.DoctypeStart, '<!'),
          new GreenToken(SyntaxKinds.Ident, 'doctype'),
          new GreenToken(SyntaxKinds.Trivia, ' '),
          new GreenToken(SyntaxKinds.Ident, kind),
          new GreenToken(SyntaxKinds.TagEnd, '>')
        ])
      )
    );
  }

  /**
   * Create a new opening tag syntax.
   *
   * @param {string} name The tag name to open.
   * @param {AttributeSyntax[]} [attributes] Any attributes for this tag.
   * @return {StartTagSyntax} theThe new tag syntax.
   */
  public static startTag(
    name: string,
    attributes: AttributeSyntax[] | undefined = undefined
  ): StartTagSyntax {
    const body: GreenElement[] = [
      new GreenToken(SyntaxKinds.TagStart, '<'),
      new GreenToken(SyntaxKinds.Ident, name)
    ];

    if (attributes !== undefined) {
      const space = new GreenToken(SyntaxKinds.Trivia, ' ');
      for (const attr of attributes) {
        body.push(space);
        body.push(attr.rawSyntax.rawItem);
      }
    }

    body.push(new GreenToken(SyntaxKinds.TagEnd, '>'));
    return new StartTagSyntax(
      new RedNode(null, 0, new GreenNode(SyntaxKinds.OpeningTag, body))
    );
  }

  /**
   * Create a new end tag syntax.
   *
   * @param {string} name The tag name to close.
   * @return {TagSyntax} The new end tag.
   */
  public static endTag(name: string): TagSyntax {
    return new TagSyntax(
      new RedNode(
        null,
        0,
        new GreenNode(SyntaxKinds.ClosingTag, [
          new GreenToken(SyntaxKinds.TagStart, '</'),
          new GreenToken(SyntaxKinds.Ident, name),
          new GreenToken(SyntaxKinds.TagEnd, '>')
        ])
      )
    );
  }
}
