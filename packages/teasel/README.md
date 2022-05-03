# Teasel

 > Teasing HTML elements from plain text.

Teasel is a lightweight and error tolerant HTML parser built around lossless
syntax trees. Teasel doesn't aim to parse HTML into a DOM. Instead the end goal
is to provide a syntax tree complete with all the trivia from the original
source text ready for syntactic or semantic analysis.

Teasel is split into three main layers: `tokenise`, `parse`, and `syntax`. The
`tokenise` layer provides the `Tokenizer` which splits apart source text into
the constituent tokens of HTML. The `parse` layer provides an error-tolerant
parser which builds a lossless syntax tree using the Pyracantha library. Finally
the `syntax` layer provides a strongly typed layer to query the weakly typed
tree, as well as a `SyntaxFactory` for fabricating syntax items in code.

## Quickstart

The main entry point to *Teasel* are the `Parser.parseDocument()` and
`Parser.parseFragment()` functions. Each takes a buffer and parses it into a
typed syntax tree. The `parseDocument` function interprets the buffer asn a
fully fledged HTML document, including a document type declaration. The
`parseFragment` function instead just interprets the body as a fragment of a
larger HTML document and expects only a sequence of elements.

```typescript
const result = Parser.parseDocument("<html><p>hello world");

// Diagnostic because the doctype is missing. To avoid this
// diagnostic we could have used the `parseFragment` API.
assert.equal(result.diagnostics[0].message, 'Missing doctype.');

// The doctype node in the tree is null, but the rest of
// the tree is there
assert.isNull(result.root.doctype);

// The root has one child element, an HTML node with a missing
// end tag.
const rootElements = Array.from(result.root.childElements());
assert.equal(rootElements.length, 1);
assert.equal(rootElements[0].startTag()?.name, 'html');
assert.isNull(rootElements[0].endTag());
```

From this we can see that the `parse*` functions return a `ParseResult` type.
This result always contains two things: a collection of any `Diagnostic`s that
were generated when parsing, and a syntax tree. No matter how malformed the
input text _some_ kind of syntax tree will be produced, however meaningless.
Missing parts of the document are elided from the tree. Malformed parts are
wrapped in `Error` nodes. When walking a tree elements are never guaranteed
to exist and instead are usually typed `T | undefined` to represent this. If
a given node that should back a syntax item is missing then `undfined` is
returned. This is used to model both 'expected' missing items, such as the
closing tag on a [void element][void-element], as well as expeced items that are
missing such as the `DOCTYPE` in the above example.

 [void-element]: https://html.spec.whatwg.org/multipage/syntax.html#void-elements