import {assert} from 'chai';
import {GreenNode} from '../../../syntax/pyracantha/GreenNode.js';
import {GreenTreeBuilder} from '../../../syntax/pyracantha/GreenTreeBuilder.js';

suite('Green Tree Builder', () => {
  test('build empty tree has root node', () => {
    const builder = new GreenTreeBuilder();

    const node = builder.buildRoot(101);

    assert.equal(node.kind, 101);
    assert.equal(node.width, 0);
    assert.equal(node.children.length, 0);
  });

  test('build simple node', () => {
    const builder = new GreenTreeBuilder();

    builder.startNode(102);
    builder.token(1, '<');
    builder.token(2, 'html');
    builder.token(3, '>');
    builder.finishNode();

    const root = builder.buildRoot(101);

    assert.equal(root.kind, 101);
    assert.equal(root.textLength, 6);
    assert.equal(root.children.length, 1);
    assert.isTrue(root.children[0] instanceof GreenNode);
    const htmlNode = root.children[0] as GreenNode;
    assert.equal(htmlNode.kind, 102);
    assert.equal(htmlNode.children.length, 3);
    assert.equal(htmlNode.children[0].kind, 1);
    assert.equal(htmlNode.children[0].textLength, 1);
    assert.equal(htmlNode.children[1].kind, 2);
    assert.equal(htmlNode.children[1].textLength, 4);
    assert.equal(htmlNode.children[2].kind, 3);
    assert.equal(htmlNode.children[2].textLength, 1);
  });
});
