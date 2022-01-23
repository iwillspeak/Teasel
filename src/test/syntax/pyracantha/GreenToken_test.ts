import {assert} from 'chai';
import {GreenToken} from '../../../syntax/pyracantha/GreenToken.js';

suite('GreenToken', () => {
  test('instantiates correctly', () => {
    const token = new GreenToken(303, 'woop');

    assert.equal(token.kind, 303);
    assert.equal(token.text, 'woop');
  });
});
