import {GreenNode} from '../syntax/pyracantha/GreenNode.js';
import {RedNode} from '../syntax/pyracantha/RedNode.js';
import {Tokenizer} from '../tokenize/Tokenizer.js';

/**
 * Diagnostic information from the parse.
 */
interface Diagnostic {
  /**
   * The diagnostic message. This describes the reason for emitting.
   */
  message: string;

  /**
   * The source text range that the diagnostic relates to.
   */
  position: Range;
}

/**
 * The result of a single parse.
 */
interface ParseResult {
  /**
   * The root of the syntax tree.
   */
  root: RedNode;

  /**
   * The diagnostics produced during the parse.
   */
  diagnostics: Diagnostic[];
}

/**
 * The different syntax node kinds in the Pyracantha tree produced by this
 * parser.
 */
const syntaxKinds = {
  ERROR: -1
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
    return {
      root: RedNode.createRoot(new GreenNode(syntaxKinds.ERROR, [])),
      diagnostics: []
    };
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
