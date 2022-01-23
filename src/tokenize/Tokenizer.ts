/**
 * Token Kinds
 *
 * Each token kind represents a unique lexeme that the tokeniser can recognise.
 */
export enum TokenKind {
  TagStart,
  TagEnd,
  TagCloseStart,
  TagSelfClose,
  Ident,
  Eq,
  Text,
  AttributeValue,
  Space,
  Comment,
  Error,
  EndOfFile
}

/**
 * Lexer's state. Each state is a point the lexer can be in between characters
 * in the input stream.
 */
enum LexState {
  Start,
  LeftAngle,
  Close,
  RightAngle,
  Error
}

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

    const tokenKind = this.tokenKindFromFinalState(state);
    const tokenValue = this.buffer.slice(this.tokenStart, tokenEnd);
    this.tokenStart = currentCharIdx;

    return {kind: tokenKind, lexeme: tokenValue};
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
      case LexState.Close:
        return TokenKind.TagCloseStart;
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
          default:
            return LexState.Error;
        }
      case LexState.LeftAngle:
        switch (currentChar) {
          case '/':
            return LexState.Close;
          default:
            return null;
        }
      default:
        return null;
    }
  }
}
