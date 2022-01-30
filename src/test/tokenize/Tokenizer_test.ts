import {assert} from 'chai';
import {Tokenizer} from '../../tokenize/Tokenizer.js';
import {TokenKind} from '../../tokenize/TokenKind.js';

suite('Tokeniser', () => {
  test('tokenise empty string returns end of file', () => {
    const tokeniser = new Tokenizer('');

    assert.equal(tokeniser.isAtEnd, true);
    assert.equal(tokeniser.current.kind, TokenKind.EndOfFile);
    assert.equal(tokeniser.current.lexeme, '');
  });

  test('bump at end of file returns end of file', () => {
    const tokeniser = new Tokenizer('');

    assert.equal(tokeniser.current.kind, TokenKind.EndOfFile);
    tokeniser.bump();

    assert.equal(tokeniser.current.kind, TokenKind.EndOfFile);
    assert.equal(tokeniser.isAtEnd, true);

    tokeniser.bump();

    assert.equal(tokeniser.current.kind, TokenKind.EndOfFile);
    assert.equal(tokeniser.isAtEnd, true);
  });

  const tokens: [string, TokenKind][] = [
    ['<', TokenKind.TagStart],
    ['<!', TokenKind.DoctypeStart],
    ['>', TokenKind.TagEnd],
    ['</', TokenKind.TagCloseStart],
    ['p', TokenKind.Ident],
    ['script', TokenKind.Ident],
    ['href', TokenKind.Ident],
    [' ', TokenKind.Space],
    ['\t', TokenKind.Space],
    ['\t\n\r\n ', TokenKind.Space],
    ['<!---->', TokenKind.Comment],
    ['<!-- a-n --- comment --->', TokenKind.Comment],
    ['h2', TokenKind.Ident],
    ['H4', TokenKind.Ident]
  ];

  tokens.forEach(([source, expectedKind]) => {
    test(`Should tokenise ${source} as ${expectedKind}`, () => {
      const tokeniser = new Tokenizer(source);

      const token = tokeniser.current;
      tokeniser.bump();

      assert.equal(token.kind, expectedKind);
      assert.equal(token.lexeme, source);
      assert.equal(tokeniser.isAtEnd, true);
      assert.equal(tokeniser.current.kind, TokenKind.EndOfFile);
    });
  });
});
