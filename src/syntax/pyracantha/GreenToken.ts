import {SyntaxKind} from './Pyracantha';

/**
 * # Green Tree Token
 *
 * Green tokens are the leaf nodes in the green tree. Each one represents a
 * fine-grained atom of syntax. Tokens _may_ correspond to tokens from the
 * lexical analysis phase, or may be composites of several lexical tokens.
 */
export class GreenToken {
  public kind: number;
  public text: string;

  /**
   * # Create a Green Token
   *
   * Green tokens can be manually created, but it is best to use a green tree
   * builder to allow for caching of nodes and tokens.
   *
   * @param kind The kind for this token
   * @param text The text of this token
   */
  public constructor(kind: SyntaxKind, text: string) {
    this.kind = kind;
    this.text = text;
  }

  /**
   * Get the length of this token in the underlying source text. This is the
   * length of the text that makes up this token.
   */
  public get textLength(): number {
    return this.text.length;
  }
}