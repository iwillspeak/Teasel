import {RedNode} from './pyracantha/RedNode.js';
import {SyntaxKinds} from '../parse/Parser.js';
import {RedToken} from './pyracantha/RedToken.js';
import {RedElement} from './pyracantha/RedTree.js';
import {SyntaxKind} from './pyracantha/Pyracantha.js';

function nthOfKind(
  elements: IterableIterator<RedElement>,
  kind: SyntaxKind,
  n: number
): RedElement | null {
  let seen = 0;
  for (const element of elements) {
    if (element.kind === kind) {
      if (++seen === n) {
        return element;
      }
    }
  }

  return null;
}

export class DocumentFragmentSyntax {
  protected syntax: RedNode;

  public constructor(syntax: RedNode) {
    this.syntax = syntax;
  }

  public static cast(node: RedNode): DocumentFragmentSyntax | null {
    if (node.kind == SyntaxKinds.Document) {
      return new DocumentFragmentSyntax(node);
    }

    return null;
  }
}

export class DocumentSyntax extends DocumentFragmentSyntax {
  public constructor(syntax: RedNode) {
    super(syntax);
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
    const child = nthOfKind(
      this.syntax.childrenWithTokens(),
      SyntaxKinds.Ident,
      2
    );
    if (child instanceof RedToken) {
      return child.text;
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
