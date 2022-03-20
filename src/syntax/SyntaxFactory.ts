import {SyntaxKinds} from '../parse/Parser.js';
import {AttributeSyntax} from './AttributeSyntax.js';
import {GreenNode} from './pyracantha/GreenNode.js';
import {GreenToken} from './pyracantha/GreenToken.js';
import {GreenElement} from './pyracantha/GreenTree.js';
import {RedNode} from './pyracantha/RedNode.js';

/**
 * Factory methods for syntax items.
 */
export class SyntaxFactory {
  /**
   * Create a new attribute syntax with the given attribute name and value.
   *
   * @param {string} name The attribute name.
   * @param {string} [value] The attribute value.
   * @return {AttributeSyntax} The new attribute value.
   */
  public static attribute(
    name: string,
    value: string | undefined = undefined
  ): AttributeSyntax {
    const body: GreenElement[] = [new GreenToken(SyntaxKinds.Ident, name)];

    if (value !== undefined) {
      body.push(
        new GreenToken(SyntaxKinds.Trivia, '='),
        new GreenNode(SyntaxKinds.AttributeValue, [
          new GreenToken(SyntaxKinds.Trivia, '"'),
          new GreenToken(SyntaxKinds.Text, value),
          new GreenToken(SyntaxKinds.Trivia, '"')
        ])
      );
    }

    return new AttributeSyntax(
      new RedNode(null, 0, new GreenNode(SyntaxKinds.Attribute, body))
    );
  }
}
