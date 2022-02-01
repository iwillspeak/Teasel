import {assert} from 'chai';
import {readdirSync} from 'fs';
import {readFile} from 'fs/promises';
import {Parser, SyntaxKinds} from '../../parse/Parser.js';
import {debugToString} from '../../syntax/pyracantha/Debug.js';
import {DocumentSyntax} from '../../syntax/Syntax.js';
import {Tokenizer} from '../../tokenize/Tokenizer.js';

function checkParse(input: string, expected: string) {
  const result = Parser.parseText(input);
  let actual = debugToString(result.root, (k) => SyntaxKinds[k]);
  assert.equal(result.diagnostics.length, 0);
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
    const source = '<p>hello world</p>';
    const result = Parser.parseText(source);

    assert.equal(result.diagnostics.length, 0);
    assert.equal(result.root.kind, SyntaxKinds.Document);
    let children = Array.from(result.root.children());
    assert.equal(children.length, 2);
    assert.equal(children[0].kind, SyntaxKinds.Doctype);
    assert.equal(children[1].kind, SyntaxKinds.Node);
    assert.equal(result.root.toString(), source);
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
    \n`,
      `Document: {0..218}
  Doctype: {0..15}
    DoctypeStart: {0..2} "<!"
    Ident: {2..9} "DOCTYPE"
    Space: {9..10} " "
    Ident: {10..14} "html"
    TagEnd: {14..15} ">"
  Text: {15..20} "\\n    "
  Node: {20..218}
    OpeningTag: {20..26}
      TagStart: {20..21} "<"
      Ident: {21..25} "html"
      TagEnd: {25..26} ">"
    Text: {26..31} "\\n    "
    Node: {31..218}
      OpeningTag: {31..37}
        TagStart: {31..32} "<"
        Ident: {32..36} "body"
        TagEnd: {36..37} ">"
      Text: {37..42} "\\n    "
      Node: {42..62}
        OpeningTag: {42..46}
          TagStart: {42..43} "<"
          Ident: {43..45} "h1"
          TagEnd: {45..46} ">"
        Text: {46..57} "A N Example"
        ClosingTag: {57..62}
          TagStart: {57..59} "</"
          Ident: {59..61} "h2"
          TagEnd: {61..62} ">"
      Text: {62..67} "\\n    "
      Node: {67..212}
        OpeningTag: {67..70}
          TagStart: {67..68} "<"
          Ident: {68..69} "p"
          TagEnd: {69..70} ">"
        Text: {70..106} "I'm a paragraph, with an image.\\n    "
        Node: {106..200}
          OpeningTag: {106..159}
            TagStart: {106..107} "<"
            Ident: {107..110} "img"
            Space: {110..111} " "
            Attribute: {111..132}
              Ident: {111..114} "src"
              Trivia: {114..115} "="
              AttributeValue: {115..131}
                Trivia: {115..116} "\\""
                Text: {116..130} "spiky-tree.jpg"
                Trivia: {130..131} "\\""
              Space: {131..132} " "
            Attribute: {132..144}
              Ident: {132..137} "width"
              Trivia: {137..138} "="
              AttributeValue: {138..143}
                Trivia: {138..139} "\\""
                Text: {139..142} "500"
                Trivia: {142..143} "\\""
              Space: {143..144} " "
            Attribute: {144..157}
              Ident: {144..150} "height"
              Trivia: {150..151} "="
              AttributeValue: {151..156}
                Trivia: {151..152} "\\""
                Text: {152..155} "600"
                Trivia: {155..156} "\\""
              Space: {156..157} " "
            Error: {157..158} "/"
            TagEnd: {158..159} ">"
          Text: {159..164} "\\n    "
          Comment: {164..188} "<!-- comment example -->"
          Text: {188..193} "\\n    "
          ClosingTag: {193..200}
            TagStart: {193..195} "</"
            Ident: {195..199} "body"
            TagEnd: {199..200} ">"
        Text: {200..205} "\\n    "
        ClosingTag: {205..212}
          TagStart: {205..207} "</"
          Ident: {207..211} "html"
          TagEnd: {211..212} ">"
      Text: {212..218} "\\n    \\n"
      ClosingTag: {218..218}
    ClosingTag: {218..218}
  EndOfFile: {218..218} ""
    `
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
