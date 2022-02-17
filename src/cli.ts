#!/usr/bin/env node
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {Parser, SyntaxKinds} from './parse/Parser.js';
import {readFile} from 'fs/promises';
import {debugDump} from './syntax/pyracantha/Debug.js';

yargs(hideBin(process.argv))
  .command<{path: string; dump: boolean; time: boolean}>(
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

      const result = Parser.parseText(contents);
      if (argv.time) {
        console.timeEnd('parse');
        console.timeEnd('overall');
      }

      if (argv.dump) {
        debugDump(result.root, (k) => SyntaxKinds[k]);
      }
    }
  )
  .parse();
