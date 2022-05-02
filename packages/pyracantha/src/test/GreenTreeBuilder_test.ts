import {assert} from 'chai';
import {debugToString} from '../Debug.js';
import {GreenNode} from '../GreenNode.js';
import {GreenTreeBuilder} from '../GreenTreeBuilder.js';
import {RedNode} from '../RedNode.js';

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

  test('build node with marks', () => {
    const builder = new GreenTreeBuilder();

    builder.token(1, ' ');
    const nodeMark = builder.mark();
    const tagMark = builder.mark();
    builder.token(2, '<');
    builder.token(3, 'hello');
    builder.token(2, '>');
    builder.applyMark(tagMark, 100);
    builder.token(4, 'world');
    const endTagmark = builder.mark();
    builder.token(2, '<');
    builder.token(3, 'hello');
    builder.token(2, '>');
    builder.applyMark(endTagmark, 101);
    builder.token(1, '\t');
    builder.applyMark(nodeMark, 102);

    const root = builder.buildRoot(105);

    assert.equal(
      debugToString(RedNode.createRoot(root)).trim(),
      `
105: {0..21}
  1: {0..1} " "
  102: {1..21}
    100: {1..8}
      2: {1..2} "<"
      3: {2..7} "hello"
      2: {7..8} ">"
    4: {8..13} "world"
    101: {13..20}
      2: {13..14} "<"
      3: {14..19} "hello"
      2: {19..20} ">"
    1: {20..21} "\\t"`.trim()
    );
  });
});
