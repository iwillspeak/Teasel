import {SyntaxKinds} from '../parse/Parser.js';
import {AttributeSyntax} from './AttributeSyntax.js';
import {AttributeValueSyntax} from './AttributeValueSyntax.js';
import {DoctypeSyntax} from './DoctypeSyntax.js';
import {ElementSyntax} from './ElementSyntax.js';
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
  None = 'none',
  Single = 'single',
  Double = 'double'
}

/**
 * A fragment of text
 */
export interface TextFragment {
  textToken: GreenToken;
}

/**
 * Content item for a syntax element, document, or document fragment.
 */
export type Content = ElementSyntax | TextFragment;

/**
 * Create a new attribute syntax with the given attribute name and value.
 *
 * @param {string} name The attribute name.
 * @param {string | AttributeValueSyntax} [value] The attribute value.
 * @return {AttributeSyntax} The new attribute value.
 */
export function attribute(
  name: string,
  value: string | AttributeValueSyntax | undefined = undefined
): AttributeSyntax {
  const body: GreenElement[] = [new GreenToken(SyntaxKinds.Ident, name)];

  if (value !== undefined) {
    body.push(new GreenToken(SyntaxKinds.Trivia, '='));
    if (value instanceof AttributeValueSyntax) {
      body.push(value.__rawSyntax.__rawItem);
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
export function attributeValue(
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
export function doctype(kind: string): DoctypeSyntax {
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
 * @param {boolean} selfClosing Should the tag be self closing?
 * @return {StartTagSyntax} theThe new tag syntax.
 */
export function startTag(
  name: string,
  attributes: AttributeSyntax[] | undefined = undefined,
  selfClosing: boolean = false
): StartTagSyntax {
  const body: GreenElement[] = [
    new GreenToken(SyntaxKinds.TagStart, '<'),
    new GreenToken(SyntaxKinds.Ident, name)
  ];

  if (attributes !== undefined) {
    const space = new GreenToken(SyntaxKinds.Trivia, ' ');
    for (const attr of attributes) {
      body.push(space);
      body.push(attr.__rawSyntax.__rawItem);
    }
  }

  if (selfClosing) {
    body.push(new GreenToken(SyntaxKinds.TagEnd, '/>'));
  } else {
    body.push(new GreenToken(SyntaxKinds.TagEnd, '>'));
  }

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
export function endTag(name: string): TagSyntax {
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

/**
 * Create a new text node.
 *
 * @param {string} text The content of the text fragment.
 * @return {TextFragment} The new text fragment.
 */
export function text(text: string): TextFragment {
  return {textToken: new GreenToken(SyntaxKinds.Text, text)};
}

/**
 * Create an element syntax.
 *
 * @param {StartTagSyntax} start The opening tag of the element.
 * @param {Content[]} contents The content of the tag.
 * @param {TagSyntax} end The closing tag of the element.
 * @return {ElementSyntax} The newly created element.
 */
export function element(
  start: StartTagSyntax,
  contents: Content[],
  end: TagSyntax | undefined = undefined
): ElementSyntax {
  const body: GreenElement[] = [start.__rawSyntax.__rawItem];

  for (const content of contents) {
    if (content instanceof ElementSyntax) {
      body.push(content.__rawSyntax.__rawItem);
    } else {
      body.push(content.textToken);
    }
  }

  if (end !== undefined) {
    body.push(end.__rawSyntax.__rawItem);
  }

  return new ElementSyntax(
    new RedNode(null, 0, new GreenNode(SyntaxKinds.Node, body))
  );
}

/**
 * Create a new void or self closing element.
 *
 * @param {StartTagSyntax} tag The tag for this void element.
 * @returns {ElementSyntax} A new ly created element.
 */
export function voidElement(tag: StartTagSyntax): ElementSyntax {
  return new ElementSyntax(
    new RedNode(
      null,
      0,
      new GreenNode(SyntaxKinds.Node, [tag.__rawSyntax.__rawItem])
    )
  );
}
