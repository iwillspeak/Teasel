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
    assert.equal(tokeniser.peek(1).kind, TokenKind.EndOfFile);
    assert.equal(tokeniser.isAtEnd, true);

    // check the tokeniser is at the end _even_ when no tokens are buffered.
    tokeniser.bump();
    assert.isTrue(tokeniser.isAtEnd);
    tokeniser.bump();
    assert.isTrue(tokeniser.isAtEnd);
  });

  test('peek tokens at lookahead', () => {
    const tokeniser = new Tokenizer('<html>');

    assert.equal(tokeniser.current.kind, TokenKind.TagStart);
    assert.equal(tokeniser.peek(0).kind, TokenKind.TagStart);
    assert.equal(tokeniser.peek(1).kind, TokenKind.Ident);
    assert.equal(tokeniser.peek(2).kind, TokenKind.TagEnd);
    assert.equal(tokeniser.peek(3).kind, TokenKind.EndOfFile);
    assert.isFalse(tokeniser.isAtEnd);

    tokeniser.bump();
    assert.equal(tokeniser.current.kind, TokenKind.Ident);
    assert.equal(tokeniser.peek(0).kind, TokenKind.Ident);
    assert.equal(tokeniser.peek(1).kind, TokenKind.TagEnd);
    assert.equal(tokeniser.peek(2).kind, TokenKind.EndOfFile);
    assert.isFalse(tokeniser.isAtEnd);

    tokeniser.bump();
    tokeniser.bump();
    assert.isTrue(tokeniser.isAtEnd);
  });

  const tokens: [string, TokenKind][] = [
    ['<', TokenKind.TagStart],
    ['<!', TokenKind.DoctypeStart],
    ['>', TokenKind.TagEnd],
    ['</', TokenKind.TagCloseStart],
    ['/>', TokenKind.TagSelfCloseEnd],
    ['p', TokenKind.Ident],
    ['script', TokenKind.Ident],
    ['href', TokenKind.Ident],
    [' ', TokenKind.Space],
    ['\t', TokenKind.Space],
    ['\t\n\r\n ', TokenKind.Space],
    ['<!---->', TokenKind.Comment],
    ['<!-- a-n --- comment --->', TokenKind.Comment],
    ['h2', TokenKind.Ident],
    ['H4', TokenKind.Ident],
    ['"', TokenKind.DoubleQuote],
    ["'", TokenKind.SingleQuote],
    ['=', TokenKind.Eq]
  ];

  tokens.forEach(([source, expectedKind]) => {
    test(`Should tokenise ${JSON.stringify(source)} as ${
      TokenKind[expectedKind]
    }`, () => {
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
