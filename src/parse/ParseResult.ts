import {RedNode} from '../syntax/pyracantha/RedNode.js';
import {Diagnostic} from './Diagnostic.js';

/**
 * The result of a single parse.
 */
export interface ParseResult {
  /**
   * The root of the syntax tree.
   */
  root: RedNode;

  /**
   * The diagnostics produced during the parse.
   */
  diagnostics: Diagnostic[];
}
