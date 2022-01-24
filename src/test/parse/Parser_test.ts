import {assert} from 'chai';
import {Parser} from '../../parse/Parser.js';
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
});
