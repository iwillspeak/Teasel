import {RedElement} from './pyracantha/RedTree.js';
import {SyntaxKind} from './pyracantha/Pyracantha.js';

/**
 * Search a list of syntax elements for the n'th of a given kind.
 *
 * @param {IterableIterator<T>} elements The iterator of elements to search.
 * @param {SyntaxKind} kind The syntax kind to search for.
 * @param {number} n The n'th item to look for.
 * @return {T | null} The item, if found, or null.
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
