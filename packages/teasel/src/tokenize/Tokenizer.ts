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
enum CharFacts {
  Space = ' '.charCodeAt(0),
  Newline = '\n'.charCodeAt(0),
  Tab = '\t'.charCodeAt(0),
  Return = '\r'.charCodeAt(0),
  LowerA = 'a'.charCodeAt(0),
  LowerZ = 'z'.charCodeAt(0),
  UpperA = 'A'.charCodeAt(0),
  UppperZ = 'Z'.charCodeAt(0),
  Zero = '0'.charCodeAt(0),
  Nine = '9'.charCodeAt(0),
  LeftAngle = '<'.charCodeAt(0),
  RightAngle = '>'.charCodeAt(0),
  DoubleQuote = '"'.charCodeAt(0),
  SingleQuote = "'".charCodeAt(0),
  Slash = '/'.charCodeAt(0),
  Eq = '='.charCodeAt(0),
  Minus = '-'.charCodeAt(0),
  Bang = '!'.charCodeAt(0)
}

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
   * The current buffered tokens.
   */
  private bufferedTokens: Array<Token>;

  /**
   * Create a tokeniser instance.
   *
   * @param {string} text The text buffer to lex.
   */
  public constructor(text: string) {
    this.buffer = text;
    this.tokenStart = 0;
    this.bufferedTokens = [];
  }

  /**
   * Get the current token, advancing the underlying state machine if required.
   */
  public get current(): Token {
    return this.peek(0);
  }

  /**
   * Get a token with n-token lookahead.
   *
   * @param {number} [offset] The lookahead to return the token for.
   * @return {Token} The token at the given lookahead position.
   */
  public peek(offset: number): Token {
    let token = this.bufferedTokens.at(offset);
    while (token === undefined) {
      this.bufferedTokens.push(this.getNextToken());
      token = this.bufferedTokens.at(offset);
    }

    return token;
  }

  /**
   * Advance past the current token.
   */
  public bump(): void {
    if (this.bufferedTokens.shift() === undefined) {
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
    } else {
      // We have something buffered. If they are all EOF tokens we are done.
      return this.bufferedTokens.every((token) => {
        return token.kind === TokenKind.EndOfFile;
      });
    }
  }

  /**
   * Advance the state machine and retrive the next token in the stream. This
   * method always returns some {@link Token} value. If no further characters
   * are avialable in the input then the EOF token is returned.
   *
   * @return {Token} the next token.
   */
  private getNextToken(): Token {
    let state = LexState.Start;
    let currentCharIdx = this.tokenStart;
    let tokenEnd = this.tokenStart;

    while (currentCharIdx < this.buffer.length) {
      const currentChar = this.buffer.charCodeAt(currentCharIdx);
      const nextState = this.nextTransition(state, currentChar);

      if (nextState === null) {
        break;
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
   * @param {LexState} state The final state the state machine arrived at.
   * @return {TokenKind} The kind of token to produce.
   */
  private tokenKindFromFinalState(state: LexState): TokenKind {
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
   *
   * @param {LexState} state The current lexer state.
   * @param {number} currentChar The unicode code unit of the current character.
   * @return {LexState | null} The next state, if any.
   */
  private nextTransition(
    state: LexState,
    currentChar: number
  ): LexState | null {
    switch (state) {
      case LexState.Start:
        switch (currentChar) {
          case CharFacts.LeftAngle:
            return LexState.LeftAngle;
          case CharFacts.RightAngle:
            return LexState.RightAngle;
          case CharFacts.DoubleQuote:
            return LexState.DoubleQuote;
          case CharFacts.SingleQuote:
            return LexState.SingleQuote;
          case CharFacts.Slash:
            return LexState.Slash;
          case CharFacts.Eq:
            return LexState.Eq;
          case CharFacts.Tab:
          case CharFacts.Space:
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
          case CharFacts.Slash:
            return LexState.Close;
          case CharFacts.Bang:
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
        if (currentChar === CharFacts.Minus) {
          return LexState.CommentStartOneDash;
        } else {
          return null;
        }
      }
      case LexState.CommentStartOneDash: {
        if (currentChar === CharFacts.Minus) {
          return LexState.CommentStartDoubleDash;
        } else {
          return null;
        }
      }
      case LexState.InComment:
      case LexState.CommentStartDoubleDash: {
        if (currentChar === CharFacts.Minus) {
          return LexState.CommentSeenDash;
        } else {
          return LexState.InComment;
        }
      }
      case LexState.CommentSeenDash: {
        if (currentChar === CharFacts.Minus) {
          return LexState.CommentSeenDoubleDash;
        } else {
          return LexState.InComment;
        }
      }
      case LexState.CommentSeenDoubleDash: {
        switch (currentChar) {
          case CharFacts.RightAngle:
            return LexState.CommentDone;
          case CharFacts.Minus:
            return LexState.CommentSeenDoubleDash;
          default:
            return LexState.InComment;
        }
      }
      case LexState.Slash: {
        if (currentChar === CharFacts.RightAngle) {
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
   * Check if a given character represents whitespace
   *
   * @param {number} currentChar The input character code unit.
   * @return {boolean} true if the charactre represents a space.
   */
  private static isSpaceChar(currentChar: number): boolean {
    return (
      currentChar === CharFacts.Space ||
      currentChar === CharFacts.Tab ||
      currentChar === CharFacts.Newline ||
      currentChar === CharFacts.Return
    );
  }

  /**
   * Check if a given character is an identifier
   *
   * @param {number} currentChar The input character code unit.
   * @return {boolean} True if the character is an identifier character.
   */
  private static isIdentChar(currentChar: number): boolean {
    return (
      (currentChar >= CharFacts.LowerA && currentChar <= CharFacts.LowerZ) ||
      (currentChar >= CharFacts.UpperA && currentChar <= CharFacts.UppperZ) ||
      (currentChar >= CharFacts.Zero && currentChar <= CharFacts.Nine)
    );
  }
}
