# Teasel

> Teasing HTML elements from plain text

![Logo](assets/logo.png)

Teasel is an HTML syntax tree parser written in TypeScript. Teasel aims to be
a fast and reliable full-fidelity parser for HTML linters and refactoring tools.

## Key Features

 * **Full-fidelity tree** - Every byte in the input text will be represented
   somewhere in the output syntax tree, in the order it was in the source text.
 * **Fault tolerant perser** - All input texts produce an output tree, and a
   set of errors. The closer the input is to a standards-compliant HTML document
   the fewer error diagnostics.
 * **Syntax, not Semantic** - Teasel parses HTML as a _syntax_ tree. The end
   result is not an HTML DOM. This means that all the warts of the origional
   document are avilable to dig into; ideal for linters.

## Docs and Getting Started

To get started using Teasel it can be [installed from GitHub packages][pkg]:

```
$ npm install @iwillspeak/teasel@0.3.0
```

Once installed you can then parse any string containing HTML into a syntax tree:

```typescript
import {Parser} from '@iwillspeak/teasel/lib/parse/Parser.js';

const result = Parser.parseDocument('<html><p>Hello World');
```

Check out the [`teasel` docs][pkg-teasel] for where to go next.

## Repo Structure

This repository contains three main packages:

  * [`teasel`][pkg-teasel] - The main parser libary. This is the package
    you want to reference as a consumer.
  * [`pyracantha`][pkg-pyracantha] - The language agnostic low-level syntax
    tree library used by `teasel` to represent parsed documents.
  * [`teasel-cli`][pkg-teasel-cli] - A command line tool to test parsing
    HTML documents with teasel.

## 🐲 TODO 🐲:

 * [x] Handle attributes on opening tags
 * [x] Better error recovery when `expect` fails.
   * [x] Tolerate and warn on some malformed whitespace. e.g.: `< p>`.
   * [x] Malformed attribute lists synchronise on `>`.
 * [x] Node cache should cache nodes in the green tree builder.
  * [x] Node cache interface and implementation.
  * [x] Parser should accept optional cache.
 * [x] Handle Closing of outer tags correctly. e.g.: `<p><i>hello</p>`.
 * [x] Handle Closing of non-nesting siblings. e.g.: `<li>a<li>b`.
 * [x] Handling for implicit self closing of 'void' elements `<hr>` etc.
 * [x] Support for esoteric DOCTYPEs e.g. `SYSTEM 'about:legacy-compat'`.
 * [x] Document and fragment parse APIs.
 * [x] Syntax builder / factory API for creating and updating nodes.
 * [x] Handling of raw text elements. e.g. `script`, and `style`.
 * [ ] Support for character references. e.g. `&amp;`.
 * [ ] HTML / XML crossover
  * [ ] Support for *processing instructions*, e.g. `<?xml version="1.0">`.
  * [ ] Support for `CDATA` values / tokens.


 [pkg]: https://github.com/iwillspeak/Teasel/packages/1313956
 [pkg-teasel]: packages/teasel/README.md
 [pkg-teasel-cli]: packages/teasel-cli/README.md
 [pkg-pyracantha]: packages/pyracantha/README.md