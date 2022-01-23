import {SyntaxKind} from './Syntax';

export class GreenNode {
  public kind: number;
  public children: GreenElement[];
  public width: number;

  public constructor(kind: SyntaxKind, children: GreenElement[]) {
    this.kind = kind;
    this.children = children;
    this.width = children.reduce(
      (prev, current) => prev + current.textLength,
      0
    );
  }

  public get textLength(): number {
    return this.width;
  }
}

export class GreenToken {
  public kind: number;
  public text: string;

  public constructor(kind: SyntaxKind, text: string) {
    this.kind = kind;
    this.text = text;
  }

  public get textLength(): number {
    return this.text.length;
  }
}

export type GreenElement = GreenNode | GreenToken;
