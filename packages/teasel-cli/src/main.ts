import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {Parser, SyntaxKinds} from '@iwillspeak/teasel/lib/parse/Parser.js';
import {readFile} from 'fs/promises';
import {debugDump} from '@iwillspeak/pyracantha';
import {
  ElementSyntax,
  SyntaxNode
} from '@iwillspeak/teasel/lib/syntax/ElementSyntax.js';
import {start} from 'repl';
import {once} from 'events';
import {Context} from 'vm';

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

/**
 * The callback signature for REPL results
 */
type REPLCallback = (err: Error | null, res: undefined) => void;

/**
 * Run a REPL starting at the given `node`.
 *
 * @param {SyntaxNode} node The node to use as the base for the REPL.
 */
async function repl(node: SyntaxNode): Promise<void> {
  let path = '';
  /**
   *
   * @param {string} cmd The command line to process.
   * @param {Context} context Current repl context.
   * @param {string} filename The filename for the current REPL.
   * @param {REPLCallback} callback Callback for repl results.
   */
  function replEval(
    cmd: string,
    context: Context,
    filename: string,
    callback: REPLCallback
  ): void {
    const split = cmd.trim().split(' ');
    const command = split.at(0);
    switch (command?.toLowerCase()) {
      case 'quit':
      case 'exit':
        repl.close();
        callback(null, undefined);
        return;
      case 'cat':
        console.log(node.toString());
        callback(null, undefined);
        break;
      case 'ls':
        for (const child of node.childElements()) {
          console.log(`${child.startTag?.name} `);
        }
        callback(null, undefined);
        break;
      case 'cd': {
        const param = split.at(1);
        if (param == undefined) {
          callback(new Error('expecting node to change to.'), undefined);
          break;
        }

        if (param === '..') {
          if (node instanceof ElementSyntax && node.parent !== null) {
            node = node.parent;
            callback(null, undefined);
          }
          return;
        }

        const name = param.toLowerCase();
        for (const child of node.childElements()) {
          if (child.startTag?.name === name) {
            path += '/' + child.startTag?.name;
            repl.setPrompt(path + ' > ');
            node = child;
            callback(null, undefined);
            return;
          }
        }

        callback(new Error(`node '${name}' not found`), undefined);
        break;
      }
    }
  }
  const repl = start({
    input: process.stdin,
    output: process.stdin,
    prompt: '/> ',
    eval: replEval,
    ignoreUndefined: true
  });
  repl.on('close', () => {
    // Write a null line to get a blank line for the terminal prompt.
    console.log('');
  });
  await once(repl, 'close');
}
