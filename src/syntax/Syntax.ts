// import {RedNode} from './RedTree';

/**
 * Syntax Kind
 *
 * Syntax kinds are opaque markers used to indiciate the type of a node or token
 * in the concrete syntax tree of red and green nodes. It is up to the higher
 * level 'typed' AST to give these kinds meanings.
 */
export type SyntaxKind = number;

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
