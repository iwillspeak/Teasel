import {Range, SyntaxKind} from './Pyracantha.js';
import {RedElement} from './red/RedTree.js';
import {TreeWalker, walk} from './Walk.js';

/**
 * Formatter for syntax kinds
 */
export type KindFormatter = (kind: SyntaxKind) => string;

/**
 * Sink for debug output.
 */
export type OutputSink = (s: string) => void;

/**
 * Debug Walker
 *
 * This callback prints a tree to the given output sink using debug information
 * from the `kindFormatter`.
 */
class DebugWalker implements TreeWalker {
  private indent: number;

  /**
   * Create a new debug walker with the given kind formatter. The formatter is
   * used to print the syntax kinds in the tree.
   *
   * @param {KindFormatter} kindFormatter The formatter for syntax kinds.
   * @param {OutputSink} outputSink The sink for debug output.
   */
  public constructor(
    private kindFormatter: KindFormatter,
    private outputSink: OutputSink
  ) {
    this.indent = 0;
  }

  /** @inheritdoc */
  public enterNode(kind: SyntaxKind, position: Range): void {
    this.printLine(
      `${this.kindFormatter(kind)}: {${position.start}..${position.end}}`
    );
    this.indent++;
  }

  /** @inheritdoc */
  public onToken(kind: SyntaxKind, position: Range, lexeme: string): void {
    this.printLine(
      `${this.kindFormatter(kind)}: {${position.start}..${
        position.end
      }} ${JSON.stringify(lexeme)}`
    );
  }

  /** @inheritdoc */
  public leaveNode(_kind: SyntaxKind, _position: Range): void {
    this.indent--;
  }

  /**
   * Writes the given line to the output sink with the rquired indentation.
   *
   * @param {string} line The line to emit.
   */
  private printLine(line: string): void {
    this.outputSink('  '.repeat(this.indent) + line);
  }
}

/**
 * Debug Dump Tree
 *
 * Walks the given tree and prints out debug infromation for the elements in the
 * tree. Uses a configurable `kindFormatter` for printing the kinds of each
 * node.
 *
 * @param {RedElement} element The element to dump to the output sink.
 * @param {KindFormatter} kindFormatter The formatter to use for syntax kinds,
 *                                      or `toString` if not provided.
 * @param {OutputSink} outputSink The output sink to write to, or `console.log`
 *                                if not provided.
 */
export function debugDump(
  element: RedElement,
  kindFormatter: KindFormatter | undefined = undefined,
  outputSink: OutputSink | undefined = undefined
): void {
  if (kindFormatter === undefined) {
    kindFormatter = (k) => k.toString();
  }
  if (outputSink === undefined) {
    outputSink = console.log;
  }

  walk(element, new DebugWalker(kindFormatter, outputSink));
}

/**
 * Debug Representation for a Node
 *
 * @param {RedElement} elemenet The element to convert to a string.
 * @param {KindFormatter} [kindFormatter] The formatter to use for the kinds in
 *                                        the syntax tree.
 * @return {string} The debug formatted string representation of the element.
 */
export function debugToString(
  elemenet: RedElement,
  kindFormatter: KindFormatter | undefined = undefined
): string {
  let result = '';
  debugDump(elemenet, kindFormatter, (line) => {
    result += line + '\n';
  });
  return result;
}
