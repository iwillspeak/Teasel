import {assert} from 'chai';
import {QuoteStyle, SyntaxFactory} from '../../../syntax/SyntaxFactory.js';

suite('syntax factory', () => {
  test('attribute simple', () => {
    const attr = SyntaxFactory.attribute('foo', 'bar');
    assert.equal('foo="bar"', attr.toString());
  });
  test('atttribute no value', () => {
    const attr = SyntaxFactory.attribute('hello-world');
    assert.equal('hello-world', attr.toString());
  });
  test('attribute with strong value', () => {
    const attr = SyntaxFactory.attribute(
      'hello',
      SyntaxFactory.attributeValue('world')
    );
    assert.equal('hello=world', attr.toString());
  });
  test('attribute with explicit quote style', () => {
    const attr = SyntaxFactory.attribute(
      'hello',
      SyntaxFactory.attributeValue('testing things', QuoteStyle.Single)
    );
    assert.equal("hello='testing things'", attr.toString());
  });
  test('doctype simple', () => {
    const docty = SyntaxFactory.doctype('html');
    assert.equal('<!doctype html>', docty.toString());
  });
});
