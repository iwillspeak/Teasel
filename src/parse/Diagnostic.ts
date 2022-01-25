/**
 * Diagnostic information from the parse.
 */
export interface Diagnostic {
  /**
   * The diagnostic message. This describes the reason for emitting.
   */
  message: string;

  /**
   * The source text range that the diagnostic relates to.
   */
  position: Range;
}
