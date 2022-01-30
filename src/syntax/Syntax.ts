import {RedNode} from './pyracantha/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {RedToken} from './pyracantha/RedToken.js';
import {map, filter, firstOr, drop} from 'iter-tools';

export class DocumentSyntax {
  private syntax: RedNode;

  public constructor(syntax: RedNode) {
    this.syntax = syntax;
  }

  public get doctype(): DoctypeSyntax | null {
    return firstOr(
      null,
      filter((x) => x !== null, map(DoctypeSyntax.cast, this.syntax.children()))
    );
  }

  public static cast(node: RedNode): DocumentSyntax | null {
    if (node.kind == SyntaxKinds.DOCUMENT) {
      return new DocumentSyntax(node);
    }

    return null;
  }
}

export class DoctypeSyntax {
  private syntax: RedNode;

  public constructor(syntax: RedNode) {
    this.syntax = syntax;
  }

  public get documentKind(): string | null {
    return firstOr(
      null,
      drop(
        1,
        filter(
          (x) => x !== null,
          map((e) => {
            if (e instanceof RedToken && e.kind == SyntaxKinds.IDENT) {
              return e.text;
            } else {
              return null;
            }
          }, this.syntax.childrenWithTokens())
        )
      )
    );
  }

  public static cast(node: RedNode): DoctypeSyntax | null {
    if (node.kind === SyntaxKinds.DOCTYPE) {
      return new DoctypeSyntax(node);
    }

    return null;
  }
}
