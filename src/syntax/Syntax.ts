import {RedNode} from './RedTree';

// kind for a node in the syntax tree.
export type SyntaxKind = number;

interface Node {
  type: 'node';
}

interface Token {
  type: 'token';
}

type NodeOrToken = Node | Token;

function asNode(element: NodeOrToken): Node | null {
  if (element.type === 'node') {
    return element;
  }

  return null;
}

function asToken(element: NodeOrToken): Token | null {
  if (element.type === 'token') {
    return element;
  }

  return null;
}

// const ELEMENT: number = 1
// const COMMENT: number = 1

// export class Element {

//   private syntax: RedNode;

//   public constructor(syntax: RedNode) {
//     this.syntax = syntax;
//   }

//   public static cast(node: RedNode): Element | null {
//     if (node.kind === ELEMENT) {
//       return new Element(node);
//     }

//     return null;
//   }

//   public openTag(): Tag | null {
//     for (const child of this.syntax.children) {
//       const tag = Tag.cast(child);
//       if (tag !== null) {
//         return tag;
//       }
//     }

//     return null;
//   }

// }

// export class Comment {
// }

// export class DocumentType {
// }

// export class Document {
// }

// export class Attribute {
// }

// export class DocumentFragment {
// }
