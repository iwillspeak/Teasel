#!/usr/bin/env node
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {Parser, SyntaxKinds} from '@iwillspeak/teasel/lib/parse/Parser.js';
import {readFile} from 'fs/promises';
import {debugDump} from '@iwillspeak/pyracantha';

interface Options {
  path: string;
  dump: boolean;
  time: boolean;
  showHeap: boolean;
  cacheLimit: number;
}

yargs(hideBin(process.argv))
  .command<Options>(
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
