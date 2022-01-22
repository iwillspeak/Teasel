# One Single HTML Parser

Parser will be split into three parts:

 * Tokeniser which produces tokens for each character in the input.
 * Tree. A red-green tree implemenation and builder.
 * Parser a parser which builds a syntax tree from the tokens.

## Tokenisation

We will transform the input text into a series of tokens. All parts of the input
should be covered by a token, including trivia.

e.g.:

```html
<!DOCTYPE html>
<html>
<body>
<h1>A N Example</h2>
<p>I'm a paragraph, with an image.
<img src="spiky-tree.jpg" width="500" height="600" />
<!-- comment example -->
</body>
</html>
```

Tokens:

 * `<` -> START
 * `>` -> END
 * `</` -> CLOSE
 * `/>` -> SELF_CLOSE
 * `html` -> IDENT
 * `=` -> EQ
 * `"spiky-tree.jpg"` -> ATTR_VALUE
 * ` ` -> SPACE

## Parse

A hand written top down parser with one token lookahead. This uses a green tree
builder to produce a syntax tree.

## Tree

Red-green syntax tree and typed tree. The typed wrapper will have classes
specific to each node type. THe tree should be capable of representing any kind
of incomplete or malformed syntax. The tree should be faithful to the source
text. Semanitc transformation into a DOM is _not_ the intent of this library.
