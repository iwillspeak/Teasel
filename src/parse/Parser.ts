import {GreenNode} from '../syntax/pyracantha/GreenNode.js';
import {GreenToken} from '../syntax/pyracantha/GreenToken.js';
import {SyntaxKind} from '../syntax/pyracantha/Pyracantha.js';
import {RedNode} from '../syntax/pyracantha/RedNode.js';
import {Tokenizer} from '../tokenize/Tokenizer.js';
import {TokenKind} from '../tokenize/TokenKind.js';
import {ParseResult} from './ParseResult.js';

/**
 * The different syntax node kinds in the Pyracantha tree produced by this
 * parser.
 */
export const syntaxKinds = {
  ERROR: -1,

  // NODES
  DOCUMENT: 1,
  DOCTYPE: 2,

  // TOKENS
  DOCTYPE_START: 100,
  TAG_END: 101,
  IDENT: 102,
  SPACE: 103,
  END_OF_FILE: 104
};

/**
 * HTML Document Parser
 *
 * The parser is responsible for wlaknig through the tokens produced  by our
 * tokeniser and building the appropriate syntax tree.
 */
export class Parser {
  private tokens: Tokenizer;

  /**
   * Create a new parser instance for the given tokens.
   *
   * This is the low-level entry point to the parser. Generally a parser is not
   * direclty constructed and instead the {@li}
   *
   * @param tokens The tokens to parse into a tree.
   */
  public constructor(tokens: Tokenizer) {
    this.tokens = tokens;
  }

  /**
   * Parse the tokens into a tree.
   *
   * Runs a hand-written recursive descent parser over the input tokens to
   * recognise the input text as an HTML document. This function will always
   * produce _some_ tree continaing _all_ tokens in the input text. That is
   * _any_ input text _can_ be considered an HTML document. Some are just more
   * malformed than others.
   *
   * @returns A structured parse result for the syntax tree.
   */
  public parse(): ParseResult {
    const root = new GreenNode(syntaxKinds.DOCUMENT, [
      this.parseDocType(),
      this.expect(TokenKind.EndOfFile, syntaxKinds.END_OF_FILE)
    ]);

    return {
      root: RedNode.createRoot(root),
      diagnostics: []
    };
  }

  /**
   * Check if the current token is of the given kind.
   *
   * @param kind The kind to check for.
   */
  private lookingAt(kind: TokenKind): boolean {
    return this.tokens.current.kind === kind;
  }

  /**
   * Consume the current token and emit a green token of the given kind.
   *
   * @param kind Kind of syntax to emit.
   */
  private bump(kind: SyntaxKind): GreenToken {
    const token = this.tokens.current;
    this.tokens.bump();
    return new GreenToken(kind, token.lexeme);
  }

  /**
   * Checks if the current token is of the expected kind and emits a syntax
   * token into the green tree. If the token is not of the expected kind then
   * an error is buffered instead.
   *
   * @param tokenKind The kind of token to expect.
   * @param syntaxKind The kind of syntax token to emit.
   */
  private expect(tokenKind: TokenKind, syntaxKind: SyntaxKind): GreenToken {
    if (this.lookingAt(tokenKind)) {
      return this.bump(syntaxKind);
    } else {
      return new GreenToken(syntaxKinds.ERROR, '');
    }
  }

  /**
   * Parse the `<!DOCTYPE html>` node.
   */
  private parseDocType(): GreenNode {
    return new GreenNode(syntaxKinds.DOCTYPE, [
      this.expect(TokenKind.DoctypeStart, syntaxKinds.DOCTYPE_START),
      this.expect(TokenKind.Ident, syntaxKinds.IDENT),
      this.expect(TokenKind.Space, syntaxKinds.SPACE),
      this.expect(TokenKind.Ident, syntaxKinds.IDENT),
      this.expect(TokenKind.TagEnd, syntaxKinds.TAG_END)
    ]);
  }

  /**
   * Parse the given text as HTML.
   *
   * @param input The input text to parse.
   * @returns A parse result representing the document in {@link input}.
   */
  public static parseText(input: string): ParseResult {
    return new Parser(new Tokenizer(input)).parse();
  }
}
