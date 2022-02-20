import {assert} from 'chai';
import {readdirSync} from 'fs';
import {readFile} from 'fs/promises';
import {Parser, SyntaxKinds} from '../../parse/Parser.js';
import {debugToString} from '../../syntax/pyracantha/Debug.js';
import {DocumentSyntax} from '../../syntax/DocumentSyntax.js';
import {Tokenizer} from '../../tokenize/Tokenizer.js';

function checkParse(input: string, expected: string) {
  const result = Parser.parseDocumentRaw(input);
  let actual = debugToString(result.root, (k) => SyntaxKinds[k]);
  assert.equal(result.diagnostics.length, 0);
  assert.equal(actual.trim(), expected.trim());
}

suite('Parser', () => {
  test('parse empty document', () => {
    const parser = new Parser(new Tokenizer(''));

    const tree = parser.parse();

    assert.equal(tree.diagnostics.length, 1);
    assert.equal(tree.diagnostics[0].message, 'Missing doctype.');
    assert.equal(tree.diagnostics[0].position.start, 0);
    assert.equal(tree.diagnostics[0].position.end, 0);
    assert.equal(tree.root.range.start, 0);
    assert.equal(tree.root.range.end, 0);
  });

  test('parse with utility method', () => {
    const source = '<p>hello world</p>';
    const result = Parser.parseDocumentRaw(source);

    assert.equal(result.diagnostics[0].message, 'Missing doctype.');
    assert.equal(result.diagnostics[0].position.start, 0);
    assert.equal(result.diagnostics[0].position.end, 1);
    assert.equal(result.root.kind, SyntaxKinds.Document);
    let children = Array.from(result.root.children());
    assert.equal(children.length, 1);
    assert.equal(children[0].kind, SyntaxKinds.Node);
    assert.equal(result.root.toString(), source);
  });

  test('parse doctype no root', () => {
    const result = Parser.parseDocumentRaw('<!DOCTYPE html>');

    assert.equal(result.root.kind, SyntaxKinds.Document);
    assert.equal(result.root.range.start, 0);
    assert.equal(result.root.range.end, 15);
  });

  const legacyDoctypes: {
    text: string;
    keyword: string;
    public: string | null;
    system: string | null;
  }[] = [
    {
      text: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
      keyword: 'PUBLIC',
      public: '-//W3C//DTD XHTML 1.1//EN',
      system: 'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'
    },
    {
      text: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
      keyword: 'PUBLIC',
      public: '-//W3C//DTD HTML 4.01 Transitional//EN',
      system: 'http://www.w3.org/TR/html4/loose.dtd'
    },
    {
      text: '<!DOCTYPE html SYSTEM "about:legacy-compat">',
      keyword: 'SYSTEM',
      public: null,
      system: 'about:legacy-compat'
    }
  ];

  for (const testInfo of legacyDoctypes) {
    test(`parse legacy doctype '${testInfo.text}'`, () => {
      const result = Parser.parseDocument(testInfo.text);

      assert.isTrue(result.root instanceof DocumentSyntax);
      assert.equal(result.diagnostics.length, 0);
      assert.equal(result.root.range.start, 0);
      assert.equal(result.root.range.end, testInfo.text.length);

      assert.isNotNull(result.root.doctype);
      const doctype = result.root.doctype!;
      assert.equal(doctype.range.start, 0);
      assert.equal(doctype.range.end, testInfo.text.length);
      assert.equal(doctype.name?.toLowerCase(), 'html');
      assert.equal(doctype.keyword, testInfo.keyword);
      assert.equal(doctype.publicIdentifier?.text, testInfo.public);
      assert.equal(doctype.systemIdentifier?.text, testInfo.system);
    });
  }

  test('parse simple document', () => {
    const result = Parser.parseDocumentRaw('<!DOCTYPE fibble><html></html>');
    const doc = DocumentSyntax.cast(result.root);

    assert.isNotNull(doc);
    assert.isNotNull(doc?.doctype);
    assert.equal(doc?.doctype?.name, 'fibble');
  });

  test('parse attr no quotes', () => {
    const result = Parser.parseDocumentRaw('<html a = 1 b = 102 ><hr/></html>');

    const documentParts = Array.from(result.root.children());
    const htmlParts = Array.from(documentParts[0].children());
    const openTag = htmlParts[0];
    assert.equal(openTag.kind, SyntaxKinds.OpeningTag);
    const attrs = Array.from(openTag.childrenOfKind(SyntaxKinds.Attribute));
    assert.equal(attrs.length, 2);
  });

  test('parse malformed closing tags', () => {
    const result = Parser.parseDocumentRaw('<!DOCTYPE html>< html ></ html >');

    assert.equal(result.diagnostics.length, 2);
    assert.equal(result.diagnostics[0].position.start, 16);
    assert.equal(result.diagnostics[0].position.end, 17);
    assert.equal(result.diagnostics[1].position.start, 25);
    assert.equal(result.diagnostics[1].position.end, 26);
  });

  test('parse malfromed attributes', () => {
    const result = Parser.parseDocumentRaw('<!DOCTYPE html><html a="borked/>');

    assert.equal(result.diagnostics.length, 1);
    assert.equal(result.diagnostics[0].position.start, 30);
    assert.equal(
      result.diagnostics[0].message,
      'Expecting DoubleQuote but found TagSelfCloseEnd'
    );
  });

  test('parse as document', () => {
    const result = Parser.parseDocument('<!DOCTYPE html><html>');

    assert.equal(result.diagnostics.length, 0);
    assert.equal(result.root.doctype?.name, 'html');
    // TODO: more assertions here
  });

  test('parse as fragment', () => {
    const result = Parser.parseFragment('<html>');

    assert.equal(result.diagnostics.length, 0);
    // TODO: more assertions here
  });

  test('checkparse example doc', () => {
    checkParse(
      `<!DOCTYPE html>
    <html>
    <body>
    <h1>A N Example</h1>
    <p>I'm a paragraph, with an image.
    <img src="spiky-tree.jpg" width="500" height="600" />
    <!-- comment example -->
    </p>
    </body>
    </html>
    \n`,
      `
Document: {0..227}
  Doctype: {0..15}
    DoctypeStart: {0..2} "<!"
    Ident: {2..9} "DOCTYPE"
    Space: {9..10} " "
    Ident: {10..14} "html"
    TagEnd: {14..15} ">"
  Text: {15..20} "\\n    "
  Node: {20..221}
    OpeningTag: {20..26}
      TagStart: {20..21} "<"
      Ident: {21..25} "html"
      TagEnd: {25..26} ">"
    Text: {26..31} "\\n    "
    Node: {31..209}
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
          Ident: {59..61} "h1"
          TagEnd: {61..62} ">"
      Text: {62..67} "\\n    "
      Node: {67..197}
        OpeningTag: {67..70}
          TagStart: {67..68} "<"
          Ident: {68..69} "p"
          TagEnd: {69..70} ">"
        Text: {70..106} "I'm a paragraph, with an image.\\n    "
        Node: {106..159}
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
            TagEnd: {157..159} "/>"
        Text: {159..164} "\\n    "
        Comment: {164..188} "<!-- comment example -->"
        Text: {188..193} "\\n    "
        ClosingTag: {193..197}
          TagStart: {193..195} "</"
          Ident: {195..196} "p"
          TagEnd: {196..197} ">"
      Text: {197..202} "\\n    "
      ClosingTag: {202..209}
        TagStart: {202..204} "</"
        Ident: {204..208} "body"
        TagEnd: {208..209} ">"
    Text: {209..214} "\\n    "
    ClosingTag: {214..221}
      TagStart: {214..216} "</"
      Ident: {216..220} "html"
      TagEnd: {220..221} ">"
  Text: {221..227} "\\n    \\n"
  EndOfFile: {227..227} ""`
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
