import {Djb} from '../utils/Djb.js';
import {SyntaxKind} from '../Pyracantha.js';

/**
 * # Green Tree Token
 *
 * Green tokens are the leaf nodes in the green tree. Each one represents a
 * fine-grained atom of syntax. Tokens _may_ correspond to tokens from the
 * lexical analysis phase, or may be composites of several lexical tokens.
 */
export class GreenToken {
  private hashCode: number | undefined;

  /**
   * # Create a Green Token
   *
   * Green tokens can be manually created, but it is best to use a green tree
   * builder to allow for caching of nodes and tokens.
   *
   * @param {SyntaxKind} kind The kind for this token
   * @param {string} text The text of this token
   */
  public constructor(public kind: SyntaxKind, public text: string) {
    this.hashCode = undefined;
  }

  /**
   * Get the hash code for this element.
   *
   * @retrun {number} The structural hash of this token.
   */
  public get hash(): number {
    if (this.hashCode === undefined) {
      const hasher = Djb.getPooled();
      hasher.writeNumber(this.kind);
      hasher.writeString(this.text);
      this.hashCode = hasher.finish();
      Djb.returnPooled(hasher);
    }

    return this.hashCode;
  }

  /**
   * Get the length of this token in the underlying source text. This is the
   * length of the text that makes up this token.
   *
   * @return {number} The length of this element in characters.
   */
  public get textLength(): number {
    return this.text.length;
  }

  /**
   * Convert to Display String.
   *
   * @return {string} The source text represented by this token.
   */
  public toString(): string {
    return this.text;
  }
}
