import {RedNode} from './pyracantha/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {RedToken} from './pyracantha/RedToken.js';

export class DocumentSyntax {
  private syntax: RedNode;

  public constructor(syntax: RedNode) {
    this.syntax = syntax;
  }

  public get doctype(): DoctypeSyntax | null {
    for (const child of this.syntax.children()) {
      const docType = DoctypeSyntax.cast(child);
      if (docType) {
        return docType;
      }
    }
    return null;
  }

  public static cast(node: RedNode): DocumentSyntax | null {
    if (node.kind == SyntaxKinds.Document) {
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
    let seen = false;

    for (const child of this.syntax.childrenWithTokens()) {
      if (child instanceof RedToken && child.kind === SyntaxKinds.Ident) {
        if (!seen) {
          seen = true;
          continue;
        }

        return child.text;
      }
    }

    return null;
  }

  public static cast(node: RedNode): DoctypeSyntax | null {
    if (node.kind === SyntaxKinds.Doctype) {
      return new DoctypeSyntax(node);
    }

    return null;
  }
}
