import {assert} from 'chai';
import {GreenNode} from '../../../syntax/pyracantha/GreenNode.js';
import {GreenToken} from '../../../syntax/pyracantha/GreenToken.js';
import {RedNode} from '../../../syntax/pyracantha/RedNode.js';
import {SyntaxKind, Range} from '../../../syntax/pyracantha/Pyracantha.js';
import { walk } from '../../../syntax/pyracantha/Walk.js';

interface WalkInfo {
  kind: SyntaxKind,
  range: Range,
  text: string,
};

suite('Walk', () => {
  test('walk simple tree', () => {
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

    const events: WalkInfo[] = [];
    walk(tree, {
      onToken: (kind, position, lexeme) => {
        events.push({ kind: kind, range: position, text: lexeme });
      },
      enterNode: (kind, position) => {
        events.push({ kind: kind, range: position, text: '' });
      },
      leaveNode: (kind, position) => {
        events.push({ kind: kind, range: position, text: '' });
      }
    });

    assert.equal(events.length, 9);

    assert.equal(events[0].kind, 1);
    assert.equal(events[0].range.start, 0);
    assert.equal(events[0].range.end, 7);

    assert.equal(events[1].kind, 100);
    assert.equal(events[1].range.start, 0);
    assert.equal(events[1].range.end, 1);
    assert.equal(events[1].text, '(');

    assert.equal(events[2].kind, 2);
    assert.equal(events[2].range.start, 1);
    assert.equal(events[2].range.end, 6);

    assert.equal(events[3].kind, 103);
    assert.equal(events[3].range.start, 1);
    assert.equal(events[3].range.end, 3);
    assert.equal(events[3].text, '12');

    assert.equal(events[4].kind, 102);
    assert.equal(events[4].range.start, 3);
    assert.equal(events[4].range.end, 4);
    assert.equal(events[4].text, '+');

    assert.equal(events[5].kind, 103);
    assert.equal(events[5].range.start, 4);
    assert.equal(events[5].range.end, 6);
    assert.equal(events[5].text, '34');

    assert.equal(events[6].kind, 2);
    assert.equal(events[6].range.start, 1);
    assert.equal(events[6].range.end, 6);

    assert.equal(events[7].kind, 101);
    assert.equal(events[7].range.start, 6);
    assert.equal(events[7].range.end, 7);
    assert.equal(events[7].text, ')');

    assert.equal(events[8].kind, 1);
    assert.equal(events[8].range.start, 0);
    assert.equal(events[8].range.end, 7);
  });
});
