import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {Parser, SyntaxKinds} from '@iwillspeak/teasel/lib/parse/Parser.js';
import {readFile} from 'fs/promises';
import {debugDump} from '@iwillspeak/pyracantha';
import {SyntaxNode} from '@iwillspeak/teasel/lib/syntax/ElementSyntax';
import {createInterface} from 'readline';
import {once} from 'events';

interface ReplOptions {
  path: string;
}

interface ParseOptions {
  path: string;
  dump: boolean;
  time: boolean;
  showHeap: boolean;
  cacheLimit: number;
}

yargs(hideBin(process.argv))
  .command<ReplOptions>(
    ['repl <path>', '$0'],
    'interactively explore an HTML AST with a REPL',
    (args) => {
      return args.positional('path', {
        describe: 'path to the file',
        type: 'string'
      });
    },
    async (argv) => {
      const contents = await readFile(argv.path, {encoding: 'utf8'});
      const parseResult = Parser.parseDocument(contents);
      await repl(parseResult.root);
    }
  )
  .command<ParseOptions>(
    ['parse <path>', '$0'],
    'parse a HTML file and output the AST',
    (args) => {
      return args
        .positional('path', {
          describe: 'path to the file',
          type: 'string'
        })
        .option('dump', {
          describe: 'Dump the parsed file to standard output.',
          boolean: true,
          default: true
        })
        .option('showHeap', {
          describe: 'Dump the heap state after parsing.',
          boolean: true,
          default: false
        })
        .option('cacheLimit', {
          describe: "Node size limit for the parser's cache.",
          number: true,
          default: 6
        })
        .option('time', {
          describe: 'Emit timings for to standard output.',
          boolean: true,
          default: false
        });
    },
    async (argv) => {
      if (argv.time) {
        console.time('overall');
        console.time('read');
      }

      const contents = await readFile(argv.path, {encoding: 'utf8'});
      if (argv.time) {
        console.timeEnd('read');
        console.time('parse');
      }

      const result = Parser.parseDocumentRaw(contents, argv.cacheLimit);

      if (argv.time) {
        console.timeEnd('parse');
        console.timeEnd('overall');
      }

      if (argv.showHeap) {
        console.log(process.memoryUsage());
      }

      if (argv.dump) {
        debugDump(result.root, (k) => SyntaxKinds[k]);
      }
    }
  )
  .parse();

export {};

async function repl(node: SyntaxNode) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdin,
    prompt: '/ > '
  });
  let path: SyntaxNode[] = [];
  rl.prompt();
  rl.on('line', (line) => {
    const split = line.trim().split(' ');
    const command = split.at(0);
    switch (command?.toLowerCase()) {
      case 'quit':
        rl.close();
        return;
      case 'cat':
        console.log(node.toString());
        break;
      case 'ls':
        for (const child of node.childElements()) {
          console.log(`${child.startTag?.name} `);
        }
      case 'cd':
        const param = split.at(1);
        if (param == undefined) {
          console.error('expecting node to change to.');
          break;
        }
        const name = param.toLowerCase();
        for (const child of node.childElements()) {
          if (child.startTag?.name === name) {
            path.push(node);
            rl.setPrompt(path.join('/') + ' >');
            node = child;
            break;
          }
        }
        console.error(`node ${node} not found`);
        break;
    }
    rl.prompt();
  });
  await once(rl, 'close');
  console.log('done');
}
