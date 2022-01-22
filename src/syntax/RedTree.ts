import {GreenNode, GreenToken} from './GreenTree';
import {SyntaxKind} from './Syntax';

export type RedElement = RedNode | RedToken;

export interface Range {
  start: number;
  end: number;
}

export class RedNode {
  private parent: RedNode | null;
  private offset: number;
  private green: GreenNode;

  public constructor(parent: RedNode | null, offset: number, green: GreenNode) {
    this.parent = parent;
    this.offset = offset;
    this.green = green;
  }

  public static createRoot(node: GreenNode): RedNode {
    return new RedNode(null, 0, node);
  }

  public get kind(): SyntaxKind {
    return this.green.kind;
  }

  public get range(): Range {
    return {start: this.offset, end: this.green.textLength + this.offset};
  }

  public *childrenWithTokens(): IterableIterator<RedElement> {
    var index = this.offset;
    for (const child of this.green.children) {
      if (child instanceof GreenNode) {
        yield new RedNode(this, index, child);
      } else {
        yield new RedToken(this, index, child);
      }
      index += child.textLength;
    }
  }

  public *children(): IterableIterator<RedNode> {
    for (const child of this.childrenWithTokens()) {
      if (child instanceof RedNode) {
        yield child;
      }
    }
  }
}

export class RedToken {
  private parent: RedNode | null;
  private offset: number;
  private green: GreenToken;

  public constructor(
    parent: RedNode | null,
    offset: number,
    green: GreenToken
  ) {
    this.parent = parent;
    this.offset = offset;
    this.green = green;
  }

  public get kind(): SyntaxKind {
    return this.green.kind;
  }

  public get range(): Range {
    return {start: this.offset, end: this.green.textLength + this.offset};
  }
}
