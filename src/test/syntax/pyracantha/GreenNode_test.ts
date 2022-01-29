import {assert} from 'chai';
import {GreenNode} from '../../../syntax/pyracantha/GreenNode.js';
import {GreenToken} from '../../../syntax/pyracantha/GreenToken.js';

suite('GreenNode', () => {
  test('empty node is 0 wide', () => {
    const node = new GreenNode(101, []);

    assert.equal(node.kind, 101);
    assert.equal(0, node.textLength);
  });

  test('node width includes children', () => {
    const node = new GreenNode(101, [
      new GreenToken(102, 'hello'),
      new GreenNode(101, [
        new GreenToken(102, 'test'),
        new GreenToken(102, 'world')
      ])
    ]);

    assert.equal(node.kind, 101);
    assert.equal(14, node.textLength);
  });

  test('node to string', () => {
    const node = new GreenNode(101, [
      new GreenToken(102, 'hello'),
      new GreenToken(102, ' '),
      new GreenNode(101, [
        new GreenToken(102, ''),
        new GreenToken(102, 'world'),
        new GreenNode(104, [])
      ]),
      new GreenToken(102, '!')
    ]);

    assert.equal(node.toString(), 'hello world!');
  });
});
