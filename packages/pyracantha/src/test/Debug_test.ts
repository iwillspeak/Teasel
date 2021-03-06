import {assert} from 'chai';
import {GreenNode} from '../green/GreenNode.js';
import {GreenToken} from '../green/GreenToken.js';
import {RedNode} from '../red/RedNode.js';
import {debugToString} from '../Debug.js';

enum Kind {
  Node = 1,
  Binary = 2,
  Number = 100,
  Open = 101,
  Close = 102,
  Add = 103
}

suite('Debug', () => {
  test('debug simple tree', () => {
    const tree = RedNode.createRoot(
      new GreenNode(Kind.Node, [
        new GreenToken(Kind.Open, '('),
        new GreenNode(Kind.Binary, [
          new GreenToken(Kind.Number, '12'),
          new GreenToken(Kind.Add, '+'),
          new GreenToken(Kind.Number, '34')
        ]),
        new GreenToken(Kind.Close, ')')
      ])
    );

    const formatted = debugToString(tree, (kind) => {
      return Kind[kind as Kind];
    });

    assert.equal(
      formatted,
      `Node: {0..7}
  Open: {0..1} "("
  Binary: {1..6}
    Number: {1..3} "12"
    Add: {3..4} "+"
    Number: {4..6} "34"
  Close: {6..7} ")"
`
    );
  });
});
