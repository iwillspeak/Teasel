/**
 * Token Kinds
 *
 * Each token kind represents a unique lexeme that the tokeniser can recognise.
 */
export enum TokenKind {
  TagStart,
  TagEnd,
  TagCloseStart,
  TagSelfCloseEnd,
  DoctypeStart,
  Ident,
  Eq,
  Text,
  AttributeValue,
  Space,
  Comment,
  Error,
  EndOfFile,
  SingleQuote,
  DoubleQuote
}
