import {assert} from 'chai';
import {readdirSync} from 'fs';
import {readFile} from 'fs/promises';
import {Parser, SyntaxKinds} from '../../parse/Parser.js';
import {debugDump} from '../../syntax/pyracantha/Debug.js';
import {DocumentSyntax} from '../../syntax/Syntax.js';
import {Tokenizer} from '../../tokenize/Tokenizer.js';

function checkParse(input: string, expected: string) {
  const result = Parser.parseText(input);
  let actual = '';
  debugDump(
    result.root,
    (k) => SyntaxKinds[k],
    (s) => {
      actual += s + '\n';
    }
  );
  assert.equal(actual.trim(), expected.trim());
}

suite('Parser', () => {
  test('parse empty document', () => {
    const parser = new Parser(new Tokenizer(''));

    const tree = parser.parse();

    assert.equal(tree.diagnostics.length, 0);
    assert.equal(tree.root.range.start, 0);
    assert.equal(tree.root.range.end, 0);
  });

  test('parse with utility method', () => {
    const result = Parser.parseText('<p>hello world</p>');

    assert.equal(result.diagnostics.length, 0);
    // TODO: More assertions here.
  });

  test('parse doctype no root', () => {
    const result = Parser.parseText('<!DOCTYPE html>');

    assert.equal(result.root.kind, SyntaxKinds.Document);
    assert.equal(result.root.range.start, 0);
    assert.equal(result.root.range.end, 15);
  });

  test('parse simple document', () => {
    const result = Parser.parseText('<!DOCTYPE fibble><html></html>');
    const doc = DocumentSyntax.cast(result.root);

    assert.isNotNull(doc);
    assert.isNotNull(doc?.doctype);
    assert.equal(doc?.doctype?.documentKind, 'fibble');
  });

  test('checkparse example doc', () => {
    checkParse(
      `<!DOCTYPE html>
    <html>
    <body>
    <h1>A N Example</h2>
    <p>I'm a paragraph, with an image.
    <img src="spiky-tree.jpg" width="500" height="600" />
    <!-- comment example -->
    </body>
    </html>
    `,
      `
DOCUMENT: {0..217}
  DOCTYPE: {0..15}
    DOCTYPE_START: {0..2} "<!"
    IDENT: {2..9} "DOCTYPE"
    SPACE: {9..10} " "
    IDENT: {10..14} "html"
    TAG_END: {14..15} ">"
  TEXT: {15..20} "\\n    "
  NODE: {20..217}
    OPENING_TAG: {20..26}
      TAG_START: {20..21} "<"
      IDENT: {21..25} "html"
      TAG_END: {25..26} ">"
    TEXT: {26..31} "\\n    "
    NODE: {31..217}
      OPENING_TAG: {31..37}
        TAG_START: {31..32} "<"
        IDENT: {32..36} "body"
        TAG_END: {36..37} ">"
      TEXT: {37..42} "\\n    "
      NODE: {42..62}
        OPENING_TAG: {42..46}
          TAG_START: {42..43} "<"
          IDENT: {43..45} "h1"
          TAG_END: {45..46} ">"
        TEXT: {46..57} "A N Example"
        CLOSING_TAG: {57..62}
          TAG_START: {57..59} "</"
          IDENT: {59..61} "h2"
          TAG_END: {61..62} ">"
      TEXT: {62..67} "\\n    "
      NODE: {67..212}
        OPENING_TAG: {67..70}
          TAG_START: {67..68} "<"
          IDENT: {68..69} "p"
          TAG_END: {69..70} ">"
        TEXT: {70..106} "I'm a paragraph, with an image.\\n    "
        NODE: {106..200}
          OPENING_TAG: {106..110}
            TAG_START: {106..107} "<"
            IDENT: {107..110} "img"
          TEXT: {110..164} " src=\\"spiky-tree.jpg\\" width=\\"500\\" height=\\"600\\" />\\n    "
          COMMENT: {164..188} "<!-- comment example -->"
          TEXT: {188..193} "\\n    "
          CLOSING_TAG: {193..200}
            TAG_START: {193..195} "</"
            IDENT: {195..199} "body"
            TAG_END: {199..200} ">"
        TEXT: {200..205} "\\n    "
        CLOSING_TAG: {205..212}
          TAG_START: {205..207} "</"
          IDENT: {207..211} "html"
          TAG_END: {211..212} ">"
      TEXT: {212..217} "\\n    "
      CLOSING_TAG: {217..217}
    CLOSING_TAG: {217..217}
  END_OF_FILE: {217..217} ""`
    );
  });

  const base = new URL('../../../test/fixture/checkparse/', import.meta.url);
  const checkparseTests = readdirSync(base);
  for (const entryPath of checkparseTests) {
    if (entryPath.endsWith('.html')) {
      const astPath = entryPath.replace(/.html$/, '.ast');
      test(`Parse ${entryPath}`, async () => {
        const text = await readFile(new URL(entryPath, base), {
          encoding: 'utf8'
        });
        const ast = await readFile(new URL(astPath, base), {encoding: 'utf8'});

        checkParse(text, ast);
      });
    }
  }
});
