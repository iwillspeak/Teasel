import {GreenNode} from '../syntax/pyracantha/GreenNode.js';
import {GreenToken} from '../syntax/pyracantha/GreenToken.js';
import {GreenTreeBuilder} from '../syntax/pyracantha/GreenTreeBuilder.js';
import {SyntaxKind} from '../syntax/pyracantha/Pyracantha.js';
import {RedNode} from '../syntax/pyracantha/RedNode.js';
import {Tokenizer} from '../tokenize/Tokenizer.js';
import {TokenKind} from '../tokenize/TokenKind.js';
import {Diagnostic} from './Diagnostic.js';
import {ParseResult} from './ParseResult.js';

/**
 * The different syntax node kinds in the Pyracantha tree produced by this
 * parser.
 */
export enum SyntaxKinds {
  ERROR = -1,

  // NODES
  DOCUMENT = 1,
  DOCTYPE = 2,
  NODE = 3,
  OPENING_TAG = 4,
  CLOSING_TAG = 5,

  // TOKENS
  TAG_START = 100,
  TAG_END = 101,
  IDENT = 102,
  SPACE = 103,
  END_OF_FILE = 104,
  TEXT = 105,
  COMMENT = 106,
  DOCTYPE_START = 107
}

/**
 * Token set information. Used by the parser for advanced look-aheads.
 */
const tokenSets = {
  /**
   * The follow set of text nodes. This is used to prevent the parser eating
   * into a strucutred element when parsing a text node.
   */
  TEXT_FOLLOW: [
    TokenKind.TagStart,
    TokenKind.TagCloseStart,
    TokenKind.Comment,
    TokenKind.EndOfFile
  ],

  /**
   * The follow set for an inner element. This is used to prevent the parser
   * eating into closing tags, or trying to eat past the end of the stream.
   */
  INNER_ELEMENT_FOLLOW: [TokenKind.TagCloseStart, TokenKind.EndOfFile]
};

/**
 * HTML Document Parser
 *
 * The parser is responsible for wlaknig through the tokens produced  by our
 * tokeniser and building the appropriate syntax tree.
 */
export class Parser {
  private tokens: Tokenizer;
  private builder: GreenTreeBuilder;
  private errors: Diagnostic[];

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
    // FIXME: Once this takes a token cache we should add a constructor so a
    //        shared cache can be provided.
    this.builder = new GreenTreeBuilder();
    this.errors = [];
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
    this.parseDocType();
    while (!this.lookingAt(TokenKind.EndOfFile)) {
      this.parseRootElement();
    }
    this.expect(TokenKind.EndOfFile, SyntaxKinds.END_OF_FILE);

    return {
      root: RedNode.createRoot(this.builder.buildRoot(SyntaxKinds.DOCUMENT)),
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
   * Check if the current token is one of the given kinds.
   *
   * @param kinds The token kinds to check for.
   * @returns True if the current token is one of the given kinds.
   */
  private lookingAtAny(kinds: TokenKind[]): boolean {
    const currentKind = this.tokens.current.kind;
    return kinds.includes(currentKind);
  }

  /**
   * Consume the current token and emit a green token of the given kind.
   *
   * @param kind Kind of syntax to emit.
   */
  private bump(kind: SyntaxKind) {
    const token = this.tokens.current;
    this.tokens.bump();
    this.builder.token(kind, token.lexeme);
  }

  /**
   * Checks if the current token is of the expected kind and emits a syntax
   * token into the green tree. If the token is not of the expected kind then
   * an error is buffered instead.
   *
   * @param tokenKind The kind of token to expect.
   * @param syntaxKind The kind of syntax token to emit.
   */
  private expect(tokenKind: TokenKind, syntaxKind: SyntaxKind) {
    if (this.lookingAt(tokenKind)) {
      this.bump(syntaxKind);
    } else {
      this.raiseError(
        `Expecting ${TokenKind[tokenKind]} but found ${
          TokenKind[this.tokens.current.kind]
        }`
      );
    }
  }

  /**
   * Raise a parser error at the current position.
   *
   * This buffers up a diagnostic message
   * @param message The error message to raise.
   */
  private raiseError(message: string) {
    this.errors.push({
      message: message,
      position: this.tokens.current.range
    });
  }

  /**
   * Parse the `<!DOCTYPE html>` node.
   */
  private parseDocType() {
    this.builder.startNode(SyntaxKinds.DOCTYPE);
    this.expect(TokenKind.DoctypeStart, SyntaxKinds.DOCTYPE_START);
    this.expect(TokenKind.Ident, SyntaxKinds.IDENT);
    this.expect(TokenKind.Space, SyntaxKinds.SPACE);
    this.expect(TokenKind.Ident, SyntaxKinds.IDENT);
    this.expect(TokenKind.TagEnd, SyntaxKinds.TAG_END);
    this.builder.finishNode();
  }

  /**
   * Parse a single element in the document. This can be either a node, a text
   * elemenet, or a comment or other trivia.
   */
  private parseRootElement() {
    if (this.lookingAt(TokenKind.TagCloseStart)) {
      this.raiseError('Unexpected end tag at document root');
      this.parseEndTag();
    } else {
      this.parseInnerElement();
    }
  }

  /**
   * Parse an inner element.
   */
  private parseInnerElement() {
    if (this.lookingAt(TokenKind.TagStart)) {
      this.parseNode();
    } else if (this.lookingAt(TokenKind.Comment)) {
      this.bump(SyntaxKinds.COMMENT);
    } else {
      this.parseText();
    }
  }

  /**
   * Parse a single node, be it a standard or self-closing one.
   */
  private parseNode() {
    this.builder.startNode(SyntaxKinds.NODE);
    let selfClosing = this.parseStartTag();
    if (!selfClosing) {
      while (!this.lookingAtAny(tokenSets.INNER_ELEMENT_FOLLOW)) {
        this.parseInnerElement();
      }

      this.parseEndTag();
    }
    this.builder.finishNode();
  }

  /**
   * Parse the start tag of a node.
   *
   * This parses the identifier, attributes, and close of the start tag. If the
   * tag is explicitly self-closing e.g. `<br/>` then the return value indicates
   * this.
   *
   * No handling yet for implicitly self-closing tags.
   *
   * @returns True if the tag is a self-closing tag, false otherwise.
   */
  private parseStartTag(): boolean {
    let isSelfClose = false;

    this.builder.startNode(SyntaxKinds.OPENING_TAG);
    this.expect(TokenKind.TagStart, SyntaxKinds.TAG_START);
    this.expect(TokenKind.Ident, SyntaxKinds.IDENT);

    // TODO: Attributes
    if (this.lookingAt(TokenKind.TagSelfClose)) {
      isSelfClose = true;
      this.bump(SyntaxKinds.TAG_END);
    } else {
      this.expect(TokenKind.TagEnd, SyntaxKinds.TAG_END);
    }

    this.builder.finishNode();
    return isSelfClose;
  }

  /**
   * Parse the end tag of a node. e.g. `</p>`.
   */
  private parseEndTag() {
    this.builder.startNode(SyntaxKinds.CLOSING_TAG);
    this.expect(TokenKind.TagCloseStart, SyntaxKinds.TAG_START);
    this.expect(TokenKind.Ident, SyntaxKinds.IDENT);
    this.expect(TokenKind.TagEnd, SyntaxKinds.TAG_END);
    this.builder.finishNode();
  }

  /**
   * Parse a text element.
   */
  private parseText() {
    let accum = '';
    while (!this.lookingAtAny(tokenSets.TEXT_FOLLOW)) {
      accum += this.tokens.current.lexeme;
      this.tokens.bump();
    }
    this.builder.token(SyntaxKinds.TEXT, accum);
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
