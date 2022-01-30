import {Range, SyntaxKind} from './Pyracantha.js';
import {RedElement} from './RedTree.js';
import {TreeWalker, walk} from './Walk.js';

/**
 * Debug Walker
 *
 * This callback prints a tree to the given output sink using debug information
 * from the `kindFormatter`.
 */
export class DebugWalker implements TreeWalker {
  private indent: number;

  /**
   * Create a new debug walker with the given kind formatter. The formatter is
   * used to print the syntax kinds in the tree.
   *
   * @param kindFormatter The formatter for syntax kinds.
   */
  public constructor(
    private kindFormatter: (kind: SyntaxKind) => string,
    private outputSink: (s: string) => void
  ) {
    this.indent = 0;
  }

  public enterNode(kind: SyntaxKind, position: Range): void {
    this.printLine(
      `${this.kindFormatter(kind)}: {${position.start}..${position.end}}`
    );
    this.indent++;
  }

  public onToken(kind: SyntaxKind, position: Range, lexeme: string): void {
    this.printLine(
      `${this.kindFormatter(kind)}: {${position.start}..${
        position.end
      }} ${JSON.stringify(lexeme)}`
    );
  }

  public leaveNode(kind: SyntaxKind, position: Range): void {
    this.indent--;
  }

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
 * @param element The element to dump to the output sink.
 * @param kindFormatter The formatter to use for syntax kinds, or `toString` if not provided..
 * @param outputSink The output sink to write to, or `console.log` if not provided.
 */
export function debugDump(
  element: RedElement,
  kindFormatter: ((k: SyntaxKind) => string) | undefined = undefined,
  outputSink: ((s: string) => void) | undefined = undefined
) {
  if (kindFormatter === undefined) {
    kindFormatter = (k) => k.toString();
  }
  if (outputSink === undefined) {
    outputSink = console.log;
  }

  walk(element, new DebugWalker(kindFormatter, outputSink));
}
