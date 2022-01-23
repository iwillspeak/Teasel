import {SyntaxKind} from './Common';
import {GreenNode} from './GreenNode';
import {GreenToken} from './GreenToken';

/**
 * Element in the green tree. Either a node or a token.
 */
export type GreenElement = GreenNode | GreenToken;
