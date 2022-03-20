import {assert} from 'chai';
import {GreenNode} from '../../../syntax/pyracantha/GreenNode.js';
import {GreenToken} from '../../../syntax/pyracantha/GreenToken.js';
import {RedNode} from '../../../syntax/pyracantha/RedNode.js';

suite('RedTree', () => {
  test('simple tree', () => {
    const tree = RedNode.createRoot(
      new GreenNode(1, [
        new GreenToken(100, '('),
        new GreenNode(2, [
          new GreenToken(103, '12'),
          new GreenToken(102, '+'),
          new GreenToken(103, '34')
        ]),
        new GreenToken(101, ')')
      ])
    );

    assert.equal(tree.kind, 1);
    assert.equal(tree.range.start, 0);
    assert.equal(tree.range.end, 7);
    assert.equal(tree.toString(), '(12+34)');

    const children = Array.from(tree.childrenWithTokens());
    assert.equal(children[0].toString(), '(');
    assert.equal(children[0].kind, 100);

    assert.isTrue(children[1] instanceof RedNode);
    const node = children[1] as RedNode;
    assert.equal(node.kind, 2);
    assert.equal(node.range.start, 1);
    assert.equal(node.range.end, 6);

    assert.equal(children[2].toString(), ')');
    assert.equal(children[2].kind, 101);

    const childNodes = Array.from(tree.children());
    assert.equal(childNodes.length, 1);
    assert.equal(childNodes[0].kind, node.kind);
  });
});
