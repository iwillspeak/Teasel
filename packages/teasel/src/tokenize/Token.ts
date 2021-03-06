import {TokenKind} from './TokenKind.js';
import {Range} from '@iwillspeak/pyracantha';

/**
 * A single token in the source text.
 */

export interface Token {
  /**
   * The kind of token.
   */
  kind: TokenKind;

  /**
   * The lexical value that backs this token. This could be the empty string for
   * tokens such as EOF and error tokens.
   */
  lexeme: string;

  /**
   * Range of the token in the input.
   */
  range: Range;
}
