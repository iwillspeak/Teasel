import {SyntaxKind} from './Pyracantha';

/**
 * # Green Tree Token
 *
 * Green tokens are the leaf nodes in the green tree. Each one represents a
 * fine-grained atom of syntax. Tokens _may_ correspond to tokens from the
 * lexical analysis phase, or may be composites of several lexical tokens.
 */
export class GreenToken {
  // TODO: Hashing?
  public hash: number;

  /**
   * # Create a Green Token
   *
   * Green tokens can be manually created, but it is best to use a green tree
   * builder to allow for caching of nodes and tokens.
   *
   * @param kind The kind for this token
   * @param text The text of this token
   */
  public constructor(public kind: SyntaxKind, public text: string) {
    this.hash = Math.random();
  }

  /**
   * Get the length of this token in the underlying source text. This is the
   * length of the text that makes up this token.
   */
  public get textLength(): number {
    return this.text.length;
  }

  /**
   * Convert to Display String.
   *
   * @returns The source text represented by this token.
   */
  public toString(): string {
    return this.text;
  }
}
