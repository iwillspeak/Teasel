#!/usr/bin/env node
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {Parser, SyntaxKinds} from './parse/Parser.js';
import {readFile} from 'fs/promises';
import {debugDump} from './syntax/pyracantha/Debug.js';

yargs(hideBin(process.argv))
  .command<{path: string}>(
    ['parse <path>', '$0'],
    'parse a HTML file and output the AST',
    (args) => {
      return args.positional('path', {
        describe: 'path to the file',
        type: 'string'
      });
    },
    async (argv) => {
      const contents = await readFile(argv.path, {encoding: 'utf8'});
      const result = Parser.parseText(contents);
      debugDump(result.root, (k) => SyntaxKinds[k]);
    }
  )
  .parse();
