import {Token} from './Token.js';
import {TokenKind} from './TokenKind.js';

/**
 * Lexer's state. Each state is a point the lexer can be in between characters
 * in the input stream.
 */
enum LexState {
  Start,
  LeftAngle,
  LeftAngleBang,
  CommentStartOneDash,
  CommentStartDoubleDash,
  InComment,
  CommentSeenDash,
  CommentSeenDoubleDash,
  CommentDone,
  Close,
  RightAngle,
  Ident,
  Space,
  SingleQuote,
  DoubleQuote,
  Eq,
  Slash,
  SelfClose,
  Error
}

/**
 * Facts about characters. This is a holder for some static character sets and
 * other important information.
 */
const charFacts = {
  SPACES: ' \n\t\r',
  A_LOWER: 'a'.charCodeAt(0),
  Z_LOWER: 'z'.charCodeAt(0),
  A_UPPER: 'A'.charCodeAt(0),
  Z_UPPER: 'Z'.charCodeAt(0),
  ZERO: '0'.charCodeAt(0),
  NINE: '9'.charCodeAt(0)
};

/**
 * # HTML Tokeniser
 *
 * This class wraps a buffer of characters and produces an iterator of tokens.
 * This tokeniser has one token of look-ahead avilble in the `current` property.
 */
export class Tokenizer {
  /**
   * The buffer currently being tokenised.
   */
  private buffer: string;

  /**
   * The start of the next token.
   */
  private tokenStart: number;

  /**
   * The current token, if one is buffered.
   */
  private bufferedCurrent: Token | null;

  /**
   * Create a tokeniser instance.
   *
   * @param text The text buffer to lex.
   */
  public constructor(text: string) {
    this.buffer = text;
    this.tokenStart = 0;
    this.bufferedCurrent = null;
  }

  /**
   * Get the current token, advancing the underlying state machine if required.
   */
  public get current(): Token {
    if (this.bufferedCurrent === null) {
      this.bufferedCurrent = this.getNextToken();
    }

    return this.bufferedCurrent;
  }

  /**
   * Advance past the current token.
   */
  public bump() {
    if (this.bufferedCurrent !== null) {
      // If we had a token buffered then clear that.
      this.bufferedCurrent = null;
    } else {
      // Advance the state machine, but discard the token.
      this.getNextToken();
    }
  }

  /**
   * Check if the tokeniser is at the end of the input buffer.
   */
  public get isAtEnd(): boolean {
    if (this.tokenStart < this.buffer.length) {
      // we anre't at the end of the buffer yet.
      return false;
    } else if (this.bufferedCurrent !== null) {
      // We have something buffered. It _could_ be the final token.
      return this.bufferedCurrent.kind === TokenKind.EndOfFile;
    }

    // No characters left in the buffer, and no buffered tokens. Sounds like
    // done to me!
    return true;
  }

  /**
   * Advance the state machine and retrive the next token in the stream. This
   * method always returns some {@link Token} value. If no further characters
   * are avialable in the input then the EOF token is returned.
   */
  private getNextToken(): Token {
    let state = LexState.Start;
    let currentCharIdx = this.tokenStart;
    let tokenEnd = this.tokenStart;
    let finished = false;

    while (!finished && currentCharIdx < this.buffer.length) {
      const currentChar = this.buffer[currentCharIdx];
      const nextState = this.nextTransition(state, currentChar);

      if (nextState === null) {
        finished = true;
      } else {
        state = nextState;
        currentCharIdx++;
        tokenEnd = currentCharIdx;
      }
    }

    const token = {
      kind: this.tokenKindFromFinalState(state),
      lexeme: this.buffer.slice(this.tokenStart, tokenEnd),
      range: {start: this.tokenStart, end: tokenEnd}
    };

    this.tokenStart = currentCharIdx;

    return token;
  }

  /**
   * Get the token kind from a completed state machine state.
   *
   * @param state The final state the state machine arrived at.
   * @returns The kind of token to produce.
   */
  private tokenKindFromFinalState(state: LexState) {
    switch (state) {
      case LexState.Start:
        return TokenKind.EndOfFile;
      case LexState.RightAngle:
        return TokenKind.TagEnd;
      case LexState.LeftAngle:
        return TokenKind.TagStart;
      case LexState.LeftAngleBang:
        return TokenKind.DoctypeStart;
      case LexState.Close:
        return TokenKind.TagCloseStart;
      case LexState.Ident:
        return TokenKind.Ident;
      case LexState.Space:
        return TokenKind.Space;
      case LexState.CommentDone:
        return TokenKind.Comment;
      case LexState.SingleQuote:
        return TokenKind.SingleQuote;
      case LexState.DoubleQuote:
        return TokenKind.DoubleQuote;
      case LexState.Eq:
        return TokenKind.Eq;
      case LexState.SelfClose:
        return TokenKind.TagSelfCloseEnd;
      default:
        return TokenKind.Error;
    }
  }

  /**
   * Calcuate the Next State Transition, if Any
   *
   * Given the current {@paramref state} and {@paramref currentChar} return the
   * state transition, if any. If no transition exists then `null` is returned.
   */
  private nextTransition(
    state: LexState,
    currentChar: string
  ): LexState | null {
    switch (state) {
      case LexState.Start:
        switch (currentChar) {
          case '<':
            return LexState.LeftAngle;
          case '>':
            return LexState.RightAngle;
          case '"':
            return LexState.DoubleQuote;
          case "'":
            return LexState.SingleQuote;
          case '/':
            return LexState.Slash;
          case '=':
            return LexState.Eq;
          case '\t':
          case ' ':
            return LexState.Space;
          default:
            if (Tokenizer.isIdentChar(currentChar)) {
              return LexState.Ident;
            } else if (Tokenizer.isSpaceChar(currentChar)) {
              return LexState.Space;
            }
            return LexState.Error;
        }
      case LexState.LeftAngle:
        switch (currentChar) {
          case '/':
            return LexState.Close;
          case '!':
            return LexState.LeftAngleBang;
          default:
            return null;
        }
      case LexState.Space: {
        if (Tokenizer.isSpaceChar(currentChar)) {
          return LexState.Space;
        }

        return null;
      }
      case LexState.Ident: {
        if (Tokenizer.isIdentChar(currentChar)) {
          return LexState.Ident;
        }

        return null;
      }
      case LexState.LeftAngleBang: {
        if (currentChar === '-') {
          return LexState.CommentStartOneDash;
        } else {
          return null;
        }
      }
      case LexState.CommentStartOneDash: {
        if (currentChar === '-') {
          return LexState.CommentStartDoubleDash;
        } else {
          return null;
        }
      }
      case LexState.InComment:
      case LexState.CommentStartDoubleDash: {
        if (currentChar === '-') {
          return LexState.CommentSeenDash;
        } else {
          return LexState.InComment;
        }
      }
      case LexState.CommentSeenDash: {
        if (currentChar === '-') {
          return LexState.CommentSeenDoubleDash;
        } else {
          return LexState.InComment;
        }
      }
      case LexState.CommentSeenDoubleDash: {
        switch (currentChar) {
          case '>':
            return LexState.CommentDone;
          case '-':
            return LexState.CommentSeenDoubleDash;
          default:
            return LexState.InComment;
        }
      }
      case LexState.Slash: {
        if (currentChar === '>') {
          return LexState.SelfClose;
        } else {
          return null;
        }
      }
      default:
        return null;
    }
  }

  /**
   * Is Space Character
   *
   * @param currentChar The input character
   * @returns true if the charactre represents a space.
   */
  private static isSpaceChar(currentChar: string): boolean {
    return charFacts.SPACES.indexOf(currentChar) > -1;
  }

  /**
   * Is Identifier Character
   *
   * @param currentChar The input character.
   * @returns True if the character is an identifier character.
   */
  private static isIdentChar(currentChar: string): boolean {
    const charCode = currentChar.charCodeAt(0);

    return (
      (charCode >= charFacts.A_LOWER && charCode <= charFacts.Z_LOWER) ||
      (charCode >= charFacts.A_UPPER && charCode <= charFacts.Z_UPPER) ||
      (charCode >= charFacts.ZERO && charCode <= charFacts.NINE)
    );
  }
}
