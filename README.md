# Teasel

> Teasing HTML elements from palin text

![Logo](assets/logo.png)

Parser is be split into three parts:

 * Tokeniser which produces tokens for each character in the input.
 * Untyped tree. A red-green tree implemenation and builder.
 * Typed tree. A structured wrapper around the untyped tree for ergonomics.
 * Parser a parser which builds a syntax tree from the tokens.

## Tokenisation

We will transform the input text into a series of tokens. All parts of the input
should be covered by a token, including trivia.

## Parse

A hand written top down parser with one token lookahead. This uses a green tree
builder to produce a syntax tree.

## Tree

Red-green syntax tree and typed tree. The typed wrapper will have classes
specific to each node type. THe tree should be capable of representing any kind
of incomplete or malformed syntax. The tree should be faithful to the source
text. Semanitc transformation into a DOM is _not_ the intent of this library.

## 🐲 TODO 🐲:

 * [ ] Handle attributes on opening tags
 * [ ] Better error recorvery when `expect` fails.
   * [ ] Tolerate and warn on some malformed whitespace. e.g.: `< p>`.
   * [ ] Malformed attribute lists syncrhonise on `>`.
 * [ ] Handle Closing of outer tags correctly. e.g.: `<p><i>hello</p>`.
 * [ ] Node cache should cache nodes in the green tree builder.
  * [ ] Node cache interface and implementaiton.
  * [ ] Parser should accept optional cache.
 * [ ] Support for `CDATA` values / tokens.
 * [ ] Handling for implicit self closing of 'void' elements `<hr>` etc.
 * [ ] Handling of raw text elements. e.g. `script`, and `style`.
