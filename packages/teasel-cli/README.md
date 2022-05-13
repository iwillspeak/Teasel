# Teasel CLI

The command line interface test tool for teasel.

```
teasel-cli.js <path>

parse a HTML file and output the AST

Positionals:
  path  path to the file                                                [string]

Options:
  --help        Show help                                              [boolean]
  --version     Show version number                                    [boolean]
  --dump        Dump the parsed file to standard output.
                                                       [boolean] [default: true]
  --showHeap    Dump the heap state after parsing.    [boolean] [default: false]
  --cacheLimit  Node size limit for the parser's cache.    [number] [default: 6]
  --time        Emit timings for to standard output.  [boolean] [default: false]
```

## Examples

 * `$ teasel-cli test.html` - parse the document in `test.html`, and dump the
   syntax tree to the console.
 * `$ teasel-cli --dump=false --time test.html` - Time the parsing of
   `test.html`, but don't dump the tree to the console so it doesn't affect
   our timings.
 * `$ teasel-cli --dump=false test.html` - Show memory use after parsing
   `test.html`.
