import {assert} from 'chai';
import {SyntaxFactory} from '../../../syntax/SyntaxFactory.js';

suite('syntax factory', () => {
  test('create attributes', () => {
    const attr = SyntaxFactory.attribute('foo', 'bar');
    assert.equal('foo="bar"', attr.toString());
  });
  test('create atttribute no value', () => {
    const attr = SyntaxFactory.attribute('hello-world');
    assert.equal('hello-world', attr.toString());
  });
});
