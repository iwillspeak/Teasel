# Teasel

 > Teasing HTML elements from plain text.

Teasel is a lightweight and error tolerant HTML parser built around lossless
syntax trees. Teasel doesn't aim to parse HTML into a DOM. Instead the end goal
is to proviede a syntax tree complete with all the trivia from the origional
source text ready for syntactic or semantic analysis.

Teasel is split into three main layers: `tokenise`, `parse`, and `syntax`. The
`tokenise` layer provides the `Tokenizer` which splits apart source text into
the constituent tokens of HTML. The `parse` layer provides an error-tolerant
parser which builds a lossless syntax tree using the Pyracantha library. Finally
the `syntax` layer provides a stronlgy typed layer to query the weakly typed
tree, as well as a `SyntaxFactory` for fabircating syntax items in code.
