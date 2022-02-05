import {GreenElement} from './GreenTree.js';
import {GreenNode} from './GreenNode.js';
import {GreenToken} from './GreenToken.js';
import {SyntaxKind} from './Pyracantha.js';
import {SyntaxKinds} from '../../parse/Parser.js';

export class NodeCache {
  private size: number;

  private cachedTokens: Map<SyntaxKind, Map<string, GreenToken>>;
  private cachedNodes: Map<[SyntaxKind, GreenElement[]], GreenNode>;

  public constructor(size: number | undefined) {
    if (size === undefined) {
      size = 0;
    }

    this.size = size;
    this.cachedTokens = new Map<SyntaxKinds, Map<string, GreenToken>>();
    this.cachedNodes = new Map<[SyntaxKinds, GreenElement[]], GreenNode>();
  }

  /**
   * Create or retrieve a node of the given kind with the given children.
   *
   * @param kind The kind for this node.
   * @param children The children for this node.
   */
  createNode(kind: number, children: GreenElement[]): GreenNode {
    if (children.length >= this.size) {
      return new GreenNode(kind, children);
    }

    let found = this.cachedNodes.get([kind, children]);
    if (found === undefined) {
      found = new GreenNode(kind, children);
      this.cachedNodes.set([kind, children], found);
    }

    return found;
  }

  /**
   * Create or retrieve a token of the given kind.
   *
   * @param kind The kind for this token.
   * @param text The backing text for this token.
   */
  createToken(kind: number, text: string): GreenToken {
    let kindCache = this.cachedTokens.get(kind);

    if (kindCache === undefined) {
      kindCache = new Map<string, GreenToken>();
      this.cachedTokens.set(kind, kindCache);
    }

    let cachedToken = kindCache.get(text);

    if (cachedToken === undefined) {
      cachedToken = new GreenToken(kind, text);
      kindCache.set(text, cachedToken);
    }

    return cachedToken;
  }
}