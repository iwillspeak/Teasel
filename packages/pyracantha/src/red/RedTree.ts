import {RedNode} from './RedNode.js';
import {RedToken} from './RedToken.js';

/**
 * Element in the red tree. Either a {@link RedNode} or {@link RedToken}.
 */
export type RedElement = RedNode | RedToken;
