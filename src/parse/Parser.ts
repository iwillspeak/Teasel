import {GreenTreeBuilder} from '../syntax/pyracantha/GreenTreeBuilder.js';
import {NodeCache} from '../syntax/pyracantha/NodeCache.js';
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
  Error = -1,

  // NODES
  Document = 1,
  Doctype = 2,
  Node = 3,
  OpeningTag = 4,
  ClosingTag = 5,
  Attribute = 6,
  AttributeValue = 7,

  // TOKENS
  TagStart = 100,
  TagEnd = 101,
  Ident = 102,
  Space = 103,
  EndOfFile = 104,
  Text = 105,
  Comment = 106,
  DoctypeStart = 107,
  Trivia = 108
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
  INNER_ELEMENT_FOLLOW: [TokenKind.TagCloseStart, TokenKind.EndOfFile],

  /**
   * Tokens that occur on the boundary of a tag.
   */
  TAG_BOUNDARY: [
    TokenKind.TagStart,
    TokenKind.TagEnd,
    TokenKind.TagCloseStart,
    TokenKind.TagSelfCloseEnd,
    TokenKind.EndOfFile
  ],

  /**
   * Tokens that can end an unquoted attribute.
   */
  UNQUOTED_ATTR_FOLLOW: [
    TokenKind.TagSelfCloseEnd,
    TokenKind.TagEnd,
    TokenKind.Space,
    TokenKind.EndOfFile
  ],

  /**
   * Tokens that can end an unquoted attribute.
   */
  SINGLE_QUOTE_ATTR_FOLLOW: [
    TokenKind.TagSelfCloseEnd,
    TokenKind.TagEnd,
    TokenKind.SingleQuote,
    TokenKind.EndOfFile
  ],

  /**
   * Tokens that can end an unquoted attribute.
   */
  DOUBLE_QUOTE_ATTR_FOLLOW: [
    TokenKind.TagSelfCloseEnd,
    TokenKind.TagEnd,
    TokenKind.DoubleQuote,
    TokenKind.EndOfFile
  ],

  /**
   * The syncrhonisation tokens for attribute parsing. Used to skip past junk in
   * opening tags.
   */
  ATTR_SYNCHRONISE: [
    TokenKind.Ident,
    TokenKind.TagEnd,
    TokenKind.TagSelfCloseEnd,
    TokenKind.EndOfFile
  ]
};

interface OptionalTagInfo {
  closes: string[];
  closesWithin: string[];
}

const elementFacts = {
  /**
   * Tag names that should be treated as void elements in HTML. These tags are
   * always treated as self-closing, even if the `/>` form isn't used.
   */
  VOID_ELEMENTS: [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ],

  /**
   * Auto close sibilings. For a given element what parent elements can it auto
   * close inside. Used to allow lists and tables to be expressed more compactly.
   */
  OPTIONAL_TAGS: new Map<string, OptionalTagInfo>([
    ['body', {closes: ['head'], closesWithin: ['html']}],
    ['li', {closes: ['li'], closesWithin: ['ul', 'ol']}],
    ['dt', {closes: ['dd', 'dt'], closesWithin: ['dl']}],
    ['dd', {closes: ['dt', 'dd'], closesWithin: ['dl']}],
    // TODO: `<p>` tags are hard...
    ['rt', {closes: ['rt', 'rp'], closesWithin: ['ruby']}],
    ['rp', {closes: ['rp', 'rt'], closesWithin: ['ruby']}],
    ['optgroup', {closes: ['optgroup', 'option'], closesWithin: ['select']}],
    ['option', {closes: ['option'], closesWithin: ['select', 'optgroup']}],
    ['colgroup', {closes: ['colgroup'], closesWithin: ['table']}]
    // TODO: captions.
    // TODO: table elements.
  ])
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
   * @param cache The node cache to use for green elements.
   */
  public constructor(
    tokens: Tokenizer,
    cache: NodeCache | number | undefined = undefined
  ) {
    this.tokens = tokens;
    this.builder = new GreenTreeBuilder(cache);
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
    this.parseElements();
    this.expect(TokenKind.EndOfFile, SyntaxKinds.EndOfFile);

    return {
      root: RedNode.createRoot(this.builder.buildRoot(SyntaxKinds.Document)),
      diagnostics: this.errors
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
   * Raise an error and skip past junk tokens.
   *
   * @param message The message to use in the error description.
   * @param syncSet The syncrhonisation set for this error position.
   */
  private error(message: string, syncSet: TokenKind[]): void {
    this.raiseError(message);
    while (!this.lookingAtAny(syncSet)) {
      this.bump(SyntaxKinds.Error);
    }
  }

  /**
   * Raise a parser error at the current position.
   *
   * This buffers up a diagnostic message
   * @param message The error message to raise.
   */
  private raiseError(message: string): void {
    this.errors.push({
      message: message,
      position: this.tokens.current.range
    });
  }

  /**
   * Parse the `<!DOCTYPE html>` node.
   */
  private parseDocType(): void {
    if (this.lookingAt(TokenKind.DoctypeStart)) {
      this.builder.startNode(SyntaxKinds.Doctype);
      this.bump(SyntaxKinds.DoctypeStart);
      this.expect(TokenKind.Ident, SyntaxKinds.Ident);
      this.expect(TokenKind.Space, SyntaxKinds.Space);
      this.expect(TokenKind.Ident, SyntaxKinds.Ident);
      this.expect(TokenKind.TagEnd, SyntaxKinds.TagEnd);
      this.builder.finishNode();
    } else {
      this.error('Missing doctype.', tokenSets.TAG_BOUNDARY);
    }
  }

  /**
   * Parse a sequence of elements.
   */
  private parseElements(): void {
    const openElements = [];
    while (!this.lookingAt(TokenKind.EndOfFile)) {
      if (this.lookingAt(TokenKind.TagCloseStart)) {
        // If we are looking at a closing tag we need to parse it and find the
        // matching element to close.
        const tagMark = this.builder.mark();
        const tag = this.parseEndTag();
        const matchingTagIdx = openElements.lastIndexOf(tag);

        if (matchingTagIdx < 0) {
          // We have a mis-matched closing tag. Raise an erorr and wrap this
          // as a vestigial node.
          this.raiseError('Unexpected end tag.');
          this.builder.applyMark(tagMark, SyntaxKinds.Node);
        } else {
          // If this tag wasn't the TOS then we have some backtracking to do..
          if (openElements.length != matchingTagIdx + 1) {
            // Slice off the end tag, close any intermediate nodes.
            const endTag = this.builder.sliceOffMark(tagMark);
            while (openElements.length > matchingTagIdx + 1) {
              this.builder.finishNode();
              openElements.pop();
            }

            // Splice the tag back in and finish the node.
            this.builder.elements(endTag);
          }

          this.builder.finishNode();
          openElements.pop();
        }
      } else if (this.lookingAt(TokenKind.TagStart)) {
        const nodeMark = this.builder.mark();
        // If we are looking at a start tag parse it and push it as an open
        // element if it doesn't self-close
        this.builder.startNode(SyntaxKinds.Node);
        const tagMark = this.builder.mark();
        let [tag, selfClosing] = this.parseStartTag();

        // Handle sibbling closers here. We heck to see if there are open tags
        // that this tag should auto-close. If so we need to backtrack and
        // unwind the element stack.
        const tagInfo = elementFacts.OPTIONAL_TAGS.get(tag);
        if (tagInfo !== undefined) {
          const autoCloseIdx = this.findAutoClosers(
            openElements,
            tagInfo.closes,
            tagInfo.closesWithin
          );
          if (autoCloseIdx !== undefined) {
            // Reset the state to _before_ we parsed this opening tag.
            const openTagElements = this.builder.sliceOffMark(tagMark);
            this.builder.finishNode();
            this.builder.sliceOffMark(nodeMark);

            // Unwind the stack to the index.
            while (openElements.length > autoCloseIdx) {
              this.builder.finishNode();
              openElements.pop();
            }

            // Re-apply the saved state.
            this.builder.startNode(SyntaxKinds.Node);
            this.builder.elements(openTagElements);
          }
        }

        // If the node is self-closing then just end it now, otherwise push
        // it on to our stack of open elements.
        if (selfClosing || this.isVoidElement(tag)) {
          this.builder.finishNode();
        } else {
          openElements.push(tag);
        }
      } else if (this.lookingAt(TokenKind.Comment)) {
        this.bump(SyntaxKinds.Comment);
      } else {
        this.parseText();
      }
    }

    // Close off any un-terminated elements.
    while (openElements.pop()) {
      this.builder.finishNode();
    }
  }

  /**
   * Look for an auto-close sibling in the open element stack.
   *
   * This walks up the stack looking for a sbiling `tag` of the current tag. If
   * one is found then that should be auto-closed. We use the `autoClosesWithin`
   * set to prevent auto-closing outer siblings.
   *
   * @param openElements The open elemnet statck.
   * @param tags The tags to search for.
   * @param autoClosesWithin The containers to break the auto-close lookup.
   * @returns The index within the open elements to auto-close, or undefined.
   */
  private findAutoClosers(
    openElements: string[],
    tags: string[],
    autoClosesWithin: string[]
  ): number | undefined {
    for (let i = openElements.length - 1; i > -1; i--) {
      const element = openElements[i];
      if (tags.includes(element)) {
        return i;
      }
      if (autoClosesWithin.includes(element)) {
        break;
      }
    }

    return undefined;
  }

  /**
   * Check if the given tag is an HTML void element.
   *
   * @param tag The tag to check.
   * @returns True if the tag is an HTML void element.
   */
  private isVoidElement(tag: string): boolean {
    return elementFacts.VOID_ELEMENTS.includes(tag);
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
  private parseStartTag(): [string, boolean] {
    let isSelfClose = false;

    this.builder.startNode(SyntaxKinds.OpeningTag);
    this.expect(TokenKind.TagStart, SyntaxKinds.TagStart);
    this.tolerateWhitespace();
    const tag = this.tokens.current.lexeme.toLowerCase();
    this.expect(TokenKind.Ident, SyntaxKinds.Ident);
    this.skipWhitespace();

    while (!this.lookingAtAny(tokenSets.TAG_BOUNDARY)) {
      if (this.lookingAt(TokenKind.Ident)) {
        this.parseAttribute();
        this.skipWhitespace();
      } else {
        this.error(
          'Unexpected or malformed attribute',
          tokenSets.ATTR_SYNCHRONISE
        );
      }
    }

    if (this.lookingAt(TokenKind.TagSelfCloseEnd)) {
      isSelfClose = true;
      this.bump(SyntaxKinds.TagEnd);
    } else {
      this.expect(TokenKind.TagEnd, SyntaxKinds.TagEnd);
    }

    this.builder.finishNode();
    return [tag, isSelfClose];
  }

  /**
   * Parse the end tag of a node. e.g. `</p>`.
   */
  private parseEndTag(): string {
    this.builder.startNode(SyntaxKinds.ClosingTag);
    this.expect(TokenKind.TagCloseStart, SyntaxKinds.TagStart);
    this.tolerateWhitespace();
    const tag = this.tokens.current.lexeme.toLowerCase();
    this.expect(TokenKind.Ident, SyntaxKinds.Ident);
    this.skipWhitespace();
    this.expect(TokenKind.TagEnd, SyntaxKinds.TagEnd);
    this.builder.finishNode();
    return tag;
  }

  /**
   * # Parse an Attribute
   *
   * Parses a single attribute vlaue in one of the four valid attribute forms.
   * If an attribute has a value associated that vluae is stored in a nested
   * node.
   */
  private parseAttribute(): void {
    this.builder.startNode(SyntaxKinds.Attribute);
    this.expect(TokenKind.Ident, SyntaxKinds.Ident);
    this.skipWhitespace();
    if (this.lookingAt(TokenKind.Eq)) {
      this.bump(SyntaxKinds.Trivia);
      this.skipWhitespace();
      if (this.lookingAt(TokenKind.DoubleQuote)) {
        this.parseQuotedAttributeValue(
          TokenKind.DoubleQuote,
          tokenSets.DOUBLE_QUOTE_ATTR_FOLLOW
        );
      } else if (this.lookingAt(TokenKind.SingleQuote)) {
        this.parseQuotedAttributeValue(
          TokenKind.SingleQuote,
          tokenSets.SINGLE_QUOTE_ATTR_FOLLOW
        );
      } else {
        this.parseAttributeValue();
      }

      this.skipWhitespace();
    }

    this.builder.finishNode();
  }

  /**
   * Parse a text element.
   */
  private parseText(): void {
    this.parseTextData(tokenSets.TEXT_FOLLOW);
  }

  /**
   * Parse tokens as text data until one of the given follow tokens.
   *
   * @param follow The tokens to end the text node at.
   */
  private parseTextData(follow: TokenKind[]): void {
    let accum = '';
    while (!this.lookingAtAny(follow)) {
      accum += this.tokens.current.lexeme;
      this.tokens.bump();
    }
    this.builder.token(SyntaxKinds.Text, accum);
  }

  /**
   * Parse the value of an attribute.
   *
   * @param quote The quote to expect around the attribute value.
   * @param follow The folow set for the atttribute value.
   */
  private parseQuotedAttributeValue(
    quote: TokenKind,
    follow: TokenKind[]
  ): void {
    this.builder.startNode(SyntaxKinds.AttributeValue);
    this.expect(quote, SyntaxKinds.Trivia);
    this.parseTextData(follow);
    this.expect(quote, SyntaxKinds.Trivia);
    this.builder.finishNode();
  }

  /**
   * Parse the value of an attribute that isn't delimited by quotes.
   */
  private parseAttributeValue(): void {
    this.builder.startNode(SyntaxKinds.AttributeValue);
    this.parseTextData(tokenSets.UNQUOTED_ATTR_FOLLOW);
    this.builder.finishNode();
  }

  /**
   * Skip any whitespace at the current position.
   */
  private skipWhitespace(): void {
    while (this.lookingAt(TokenKind.Space)) {
      this.bump(SyntaxKinds.Space);
    }
  }

  /**
   * Tolerate and skip whitespace where it shouldn't be.
   */
  private tolerateWhitespace(): void {
    if (this.lookingAt(TokenKind.Space)) {
      this.raiseError('Unexpected whitespace.');
      this.skipWhitespace();
    }
  }

  /**
   * Parse the given text as HTML.
   *
   * @param input The input text to parse.
   * @param cache The node cache to use for green elements.
   * @returns A parse result representing the document in {@link input}.
   */
  public static parseText(
    input: string,
    cache: NodeCache | number | undefined = undefined
  ): ParseResult {
    return new Parser(new Tokenizer(input), cache).parse();
  }
}
