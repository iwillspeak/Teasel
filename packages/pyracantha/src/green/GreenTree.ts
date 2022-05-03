import {GreenNode} from './GreenNode.js';
import {GreenToken} from './GreenToken.js';

/**
 * Element in the green tree. Either a node or a token.
 */
export type GreenElement = GreenNode | GreenToken;
