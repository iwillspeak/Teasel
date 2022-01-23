import {GreenNode} from './GreenNode';
import {GreenToken} from './GreenToken';
import {SyntaxKind} from './Pyracantha';
import {RedNode} from './RedNode';
import {RedToken} from './RedToken';

/**
 * Element in the red tree. Either a {@link RedNode} or {@link RedToken}.
 */
export type RedElement = RedNode | RedToken;
