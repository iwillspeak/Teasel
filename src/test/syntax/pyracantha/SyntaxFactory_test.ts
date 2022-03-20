import {assert} from 'chai';
import {QuoteStyle, SyntaxFactory} from '../../../syntax/SyntaxFactory.js';

suite('syntax factory', () => {
  test('create attributes', () => {
    const attr = SyntaxFactory.attribute('foo', 'bar');
    assert.equal('foo="bar"', attr.toString());
  });
  test('create atttribute no value', () => {
    const attr = SyntaxFactory.attribute('hello-world');
    assert.equal('hello-world', attr.toString());
  });
  test('create with strong value', () => {
    const attr = SyntaxFactory.attribute(
      'hello',
      SyntaxFactory.attributeValue('world')
    );
    assert.equal('hello=world', attr.toString());
  });
  test('create with explicit quote style', () => {
    const attr = SyntaxFactory.attribute(
      'hello',
      SyntaxFactory.attributeValue('testing things', QuoteStyle.Single)
    );
    assert.equal("hello='testing things'", attr.toString());
  });
});
