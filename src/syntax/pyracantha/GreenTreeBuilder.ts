import {GreenElement} from './GreenTree';
import {GreenNode} from './GreenNode';
import {GreenToken} from './GreenToken';
import {SyntaxKind} from './Pyracantha';

interface Mark {
  children: GreenElement[];
}

export class GreenTreeBuilder {
  private nodes: Array<[SyntaxKind, GreenElement[]]> = [];
  private children: GreenElement[] = [];
  private nodeCache: unknown;

  // TODO (jg): accept a cache and set it as this.nodeCache
  public constructor() {
  }

  public startNode(kind: SyntaxKind): void {
    this.nodes.push([kind, [new GreenNode(kind, this.children)]]);
    this.children = [];
  }

  public finishNode(): void {
    const pair = this.nodes.shift();

    if (pair === undefined) {
      throw new Error('Unbalanced call to finishNode');
    }

    const [kind, oldChildren] = pair;

    // TODO (jg): check passing this.children is the right thing to do
    const node = new GreenNode(kind, this.children);

    this.children = [node, ...oldChildren];
  }

  public mark(): Mark {
    return {
      children: this.children
    };
  }

  public applyMark(mark: Mark, kind: SyntaxKind): void {
    const markLen = mark.children.length;
    const ourLen = this.children.length;

    if (ourLen < markLen) {
      throw new Error('Mark has expired. State has unwound past mark.');
    }

    // TODO (jg): ensure these slices are actually right for what was
    // intended
    const ourChildren = this.children.slice(0, ourLen - markLen);
    const bufferedChildren = this.children.slice(ourLen - markLen);

    // TODO (jg): check this equality check is enough
    if (!bufferedChildren.every((child, idx) => mark.children[idx] === child)) {
      throw new Error('Mark has expired. Child state does not match.');
    }

    const node = new GreenNode(kind, ourChildren);

    this.children = [node, ...bufferedChildren];
  }

  public token(kind: SyntaxKind, text: string): void {
    this.children.unshift(new GreenToken(kind, text));
  }

  public buildRoot(kind: SyntaxKind): GreenNode {
    if (this.nodes.length !== 0) {
      throw new Error(`Expected empty stack. Found ${this.nodes}`);
    }

    return new GreenNode(kind, this.children);
  }
}
