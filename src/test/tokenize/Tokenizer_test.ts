import {assert} from 'chai';
import {Tokenizer, TokenKind} from '../../tokenize/Tokenizer.js';

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
    ['>', TokenKind.TagEnd],
    ['</', TokenKind.TagCloseStart]
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
