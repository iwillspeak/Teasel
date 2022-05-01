import {assert} from 'chai';
import {QuoteStyle} from '../../../syntax/SyntaxFactory.js';
import * as SyntaxFactory from '../../../syntax/SyntaxFactory.js';

suite('Syntax Factory', () => {
  test('attribute simple', () => {
    const attr = SyntaxFactory.attribute('foo', 'bar');
    assert.equal('foo="bar"', attr.toString());
    assert.equal('foo', attr.name());
    assert.equal('bar', attr.value()?.text);
  });
  test('atttribute no value', () => {
    const attr = SyntaxFactory.attribute('hello-world');
    assert.equal('hello-world', attr.toString());
    assert.equal('hello-world', attr.name());
    assert.isNull(attr.value());
  });
  test('attribute with strong value', () => {
    const attr = SyntaxFactory.attribute(
      'hello',
      SyntaxFactory.attributeValue('world')
    );
    assert.equal('hello=world', attr.toString());
    assert.equal('hello', attr.name());
    assert.equal('world', attr.value()?.text);
  });
  test('attribute with explicit quote style', () => {
    const attr = SyntaxFactory.attribute(
      'hello',
      SyntaxFactory.attributeValue('testing things', QuoteStyle.Single)
    );
    assert.equal("hello='testing things'", attr.toString());
    assert.equal('hello', attr.name());
    assert.equal('testing things', attr.value()?.text);
  });
  test('doctype simple', () => {
    const docty = SyntaxFactory.doctype('html');
    assert.equal('<!doctype html>', docty.toString());
    assert.equal('html', docty.name);
  });
  test('simple tags', () => {
    const p = SyntaxFactory.startTag('p');
    assert.equal('<p>', p.toString());
    assert.equal('p', p.name);
  });
  test('self-close tag', () => {
    const emptyP = SyntaxFactory.startTag('p', undefined, true);
    assert.equal('<p/>', emptyP.toString());
  });
  test('tag with attrs', () => {
    const img = SyntaxFactory.startTag('img', [
      SyntaxFactory.attribute('width', '100'),
      SyntaxFactory.attribute('height', '50'),
      SyntaxFactory.attribute(
        'src',
        SyntaxFactory.attributeValue(
          'https://example.com/foo.jpg',
          QuoteStyle.None
        )
      ),
      SyntaxFactory.attribute(
        'alt',
        SyntaxFactory.attributeValue('awesome sauce', QuoteStyle.Single)
      )
    ]);

    assert.equal(
      '<img width="100" height="50" src=https://example.com/foo.jpg alt=\'awesome sauce\'>',
      img.toString()
    );
    assert.equal('img', img.name);
    const attrs = Array.from(img.attributes());
    assert.equal('height', attrs[1].name());
    assert.equal('50', attrs[1].value()?.text);
  });
  test('closing tag', () => {
    const secClose = SyntaxFactory.endTag('section');
    assert.equal('</section>', secClose.toString());
    assert.equal('section', secClose.name);
  });
  test('simple element', () => {
    const p = SyntaxFactory.element(
      SyntaxFactory.startTag('p', [SyntaxFactory.attribute('class', 'loud')]),
      [SyntaxFactory.text('hello world')],
      SyntaxFactory.endTag('p')
    );

    assert.equal('<p class="loud">hello world</p>', p.toString());
  });
  test('void element', () => {
    const hr = SyntaxFactory.voidElement(
      SyntaxFactory.startTag('hr', [SyntaxFactory.attribute('id', 'test')])
    );

    assert.equal('<hr id="test">', hr.toString());
  });
});
