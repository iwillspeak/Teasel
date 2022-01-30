#!/usr/bin/env node
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {Parser} from './parse/Parser.js';
import {readFile} from 'fs/promises';
import {debugDump} from './syntax/pyracantha/Debug.js';

yargs(hideBin(process.argv))
  .command<{path: string}>(
    ['parse <path>', '$0 <path>'],
    'parse a HTML file and output the AST',
    (args) => {
      return args.positional('path', {
        describe: 'path to the file'
      });
    },
    async (argv) => {
      const contents = await readFile(argv.path, {encoding: 'utf8'});
      const result = Parser.parseText(contents);
      debugDump(result.root);
    }
  )
  .parse();
