import { GreenElement } from './GreenTree.js';
import { GreenNode } from './GreenNode.js';
import { GreenToken } from './GreenToken.js';


export class NodeCache {
  private size: number;

  public constructor(size: number | undefined) {
    if (size === undefined) {
      size = 3;
    }

    this.size = size;
  }

  /**
   * Create or retrieve a node of the given kind with the given children.
   *
   * @param kind The kind for this node.
   * @param children The children for this node.
   */
  createNode(kind: number, children: GreenElement[]): GreenNode {
    return new GreenNode(kind, children);
  }

  /**
   * Create or retrieve a token of the given kind.
   *
   * @param kind The kind for this token.
   * @param text The backing text for this token.
   */
  createToken(kind: number, text: string): GreenToken {
    return new GreenToken(kind, text);
  }
}
