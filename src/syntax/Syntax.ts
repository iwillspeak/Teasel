import {RedElement} from './pyracantha/RedTree.js';
import {SyntaxKind} from './pyracantha/Pyracantha.js';

/**
 * Search a list of syntax elements for the n'th of a given kind.
 *
 * @param elements The iterator of elements to search.
 * @param kind The syntax kind to search for.
 * @param n The n'th item to look for.
 * @returns The item, if found, or null.
 */
export function nthOfKind<T extends RedElement>(
  elements: IterableIterator<T>,
  kind: SyntaxKind,
  n: number
): T | null {
  let seen = 0;
  for (const element of elements) {
    if (element.kind === kind) {
      if (++seen === n) {
        return element;
      }
    }
  }

  return null;
}
