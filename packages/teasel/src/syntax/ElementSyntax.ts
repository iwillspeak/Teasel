import {RedNode} from '@iwillspeak/pyracantha';
import {SyntaxKinds} from '../parse/Parser.js';
import {nthOfKind} from './Syntax.js';
import {StartTagSyntax} from './StartTagSyntax.js';
import {TagSyntax} from './TagSyntax.js';
import {SyntaxItem} from './SyntaxItem.js';

/**
 * A node in the syntax tree. This is any syntax item that can have HTML
 * nodes as children.
 */
export class SyntaxNode extends SyntaxItem {
  /**
   * Create a syntax node for the given red node.
   *
   * @param {RedNode} syntax The node to wrap.
   */
  public constructor(syntax: RedNode) {
    super(syntax);
  }

  /**
   * Iterator over the child elements of this syntax node.
   */
  public *childElements(): IterableIterator<ElementSyntax> {
    for (const child of this.syntax.childrenOfKind(SyntaxKinds.Node)) {
      const element = ElementSyntax.cast(child);
      if (element !== null) {
        yield element;
      }
    }
  }
}

/**
 * Sytnax wrapper for an HTML element.
 */
export class ElementSyntax extends SyntaxNode {
  /**
   * Create an eelemnet syntax for the given node.
   *
   * @param {RedNode} syntax The node to wrap.
   */
  public constructor(syntax: RedNode) {
    super(syntax);
  }

  /**
   * Get the parent node of this element.
   */
  public get parent(): ElementSyntax | null {
    if (this.syntax.parent !== null) {
      return ElementSyntax.cast(this.syntax.parent);
    }

    return null;
  }

  /**
   * Get the opening tag of this element.
   *
   * @return {StartTagSyntax | null} The opening tag, if one existed.
   */
  public get startTag(): StartTagSyntax | null {
    const child = nthOfKind(this.syntax.children(), SyntaxKinds.OpeningTag, 1);
    if (child instanceof RedNode) {
      return new StartTagSyntax(child);
    }

    return null;
  }

  /**
   * Get the closing tag of this element.
   *
   * @return {TagSyntax | null} The closing tag, if one existed.
   */
  public get endTag(): TagSyntax | null {
    const child = nthOfKind(this.syntax.children(), SyntaxKinds.ClosingTag, 1);
    if (child instanceof RedNode) {
      return new TagSyntax(child);
    }

    return null;
  }

  /**
   * Cast a raw node to the strongly typed syntax.
   *
   * @param {RedNode} node The node to cast
   * @return {ElementSyntax | null} The casted node, or null if the cast coiuld
   *                                not be made.
   */
  public static cast(node: RedNode): ElementSyntax | null {
    if (node.kind === SyntaxKinds.Node) {
      return new ElementSyntax(node);
    }

    return null;
  }
}
