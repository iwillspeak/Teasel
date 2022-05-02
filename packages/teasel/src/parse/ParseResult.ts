import {Diagnostic} from './Diagnostic.js';

/**
 * The result of a single parse.
 */
export interface ParseResult<T> {
  /**
   * The root of the syntax tree.
   */
  root: T;

  /**
   * The diagnostics produced during the parse.
   */
  diagnostics: Diagnostic[];
}
