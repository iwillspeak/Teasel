import {SyntaxKind, Range} from './Pyracantha.js';
import {RedNode} from './RedNode.js';
import {RedElement} from './RedTree.js';

/**
 * Callback interface for tree walking.
 */
export interface TreeWalker {
  /**
   * # Enter Node
   *
   * Called before any children of a given node are visited.
   *
   * @param {SyntaxKind} kind The kind of node that is beeing visited.
   * @param {Range} position The position of the node in the source text.
   */
  enterNode(kind: SyntaxKind, position: Range): void;

  /**
   * # Visit Token
   *
   * Called on each token in the tree.
   *
   * @param {SyntaxKind} kind The kind of token that is being visited.
   * @param {Range} position The position of the node in the source text.
   * @param {string} lexeme The lexical value backing this token.
   */
  onToken(kind: SyntaxKind, position: Range, lexeme: string): void;

  /**
   * # Leave Node
   *
   * @param {SyntaxKind} kind The kind of node that is being visited.
   * @param {Range} position The position of the node in the source text.
   */
  leaveNode(kind: SyntaxKind, position: Range): void;
}

/**
 * Walk a tree and with the given walker.
 *
 * @param {RedElement} element The tree to walk from.
 * @param {TreeWalker} walker The wlaker to observe the walk events.
 */
export function walk(element: RedElement, walker: TreeWalker): void {
  if (element instanceof RedNode) {
    walker.enterNode(element.kind, element.range);
    for (const child of element.childrenWithTokens()) {
      walk(child, walker);
    }
    walker.leaveNode(element.kind, element.range);
  } else {
    walker.onToken(element.kind, element.range, element.text);
  }
}
