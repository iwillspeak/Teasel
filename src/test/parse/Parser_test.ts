import {assert} from 'chai';
import {Parser, syntaxKinds} from '../../parse/Parser.js';
import {DocumentSyntax} from '../../syntax/Syntax.js';
import {Tokenizer} from '../../tokenize/Tokenizer.js';

suite('Parser', () => {
  test('parse empty document', () => {
    const parser = new Parser(new Tokenizer(''));

    const tree = parser.parse();

    assert.equal(tree.diagnostics.length, 0);
    assert.equal(tree.root.range.start, 0);
    assert.equal(tree.root.range.end, 0);
  });

  test('parse with utility method', () => {
    const result = Parser.parseText('<p>hello world</p>');

    assert.equal(result.diagnostics.length, 0);
    // TODO: More assertions here.
  });

  test('parse doctype no root', () => {
    const result = Parser.parseText('<!DOCTYPE html>');

    assert.equal(result.root.kind, syntaxKinds.DOCUMENT);
    assert.equal(result.root.range.start, 0);
    assert.equal(result.root.range.end, 15);
  });

  test('parse simple document', () => {
    const result = Parser.parseText('<!DOCTYPE fibble><html></html>');
    const doc = DocumentSyntax.cast(result.root);

    assert.isNotNull(doc);
    assert.isNotNull(doc?.doctype);
    assert.equal(doc?.doctype?.documentKind, 'fibble');
  });
});
