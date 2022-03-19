import {GreenElement} from './GreenTree.js';
import {GreenNode} from './GreenNode.js';
import {GreenToken} from './GreenToken.js';
import {SyntaxKind} from './Pyracantha.js';
import {Djb} from './Djb.js';

type Hasher<V> = (value: V) => number;
type PartialEq<V> = (left: V, right: V) => boolean;

interface MapEntry<K, V> {
  key: K;
  value: V | undefined;
}

/**
 * Node Cache Map
 *
 * A double-level map for caching syntax elements.
 */
class CacheMap<K, V> {
  private map: Map<SyntaxKind, Map<number, MapEntry<K, V>[]>>;

  public constructor(
    private hasher: Hasher<K>,
    private comparer: PartialEq<K>
  ) {
    this.map = new Map<SyntaxKind, Map<number, MapEntry<K, V>[]>>();
  }

  public entry(kind: SyntaxKind, key: K): MapEntry<K, V> {
    let slab = this.map.get(kind);
    if (slab === undefined) {
      slab = new Map<number, MapEntry<K, V>[]>();
      this.map.set(kind, slab);
    }

    const hash = this.hasher(key);
    let bucket = slab.get(hash);
    if (bucket === undefined) {
      bucket = [];
      slab.set(hash, bucket);
    }

    let entry = bucket.find((e) => {
      return this.comparer(e.key, key);
    });

    if (entry === undefined) {
      if (bucket.length > 5) {
        bucket.shift();
      }

      entry = {key: key, value: undefined};
      bucket.push(entry);
    }

    return entry;
  }
}

export class NodeCache {
  private maxNodeSize: number;
  private cachedTokens: CacheMap<string, GreenToken>;
  private cachedNodes: CacheMap<GreenElement[], GreenNode>;

  public constructor(size: number | undefined) {
    if (size === undefined) {
      // 6 seems to give the best tradeoff of parsing speed against memory use
      size = 6;
    }

    this.maxNodeSize = size;
    this.cachedTokens = new CacheMap<string, GreenToken>(
      (k) => {
        const hasher = Djb.getPooled();
        hasher.writeString(k);
        const hash = hasher.finish();
        Djb.returnPooled(hasher);
        return hash;
      },
      (l, r) => l === r
    );
    this.cachedNodes = new CacheMap<GreenElement[], GreenNode>(
      (k) => {
        const hasher = Djb.getPooled();
        hasher.writeNumber(k.length);
        for (const element of k) {
          hasher.writeNumber(element.hash);
        }
        const hash = hasher.finish();
        return hash;
      },
      (l, r) => {
        return l.length === r.length && l.every((e, i) => e === r[i]);
      }
    );
  }

  /**
   * Create or retrieve a node of the given kind with the given children.
   *
   * @param {SyntaxKind} kind The kind for this node.
   * @param {GreenElement[]} children The children for this node.
   * @return {GreenNode} The resulting node.
   */
  public createNode(kind: SyntaxKind, children: GreenElement[]): GreenNode {
    if (children.length > this.maxNodeSize) {
      return new GreenNode(kind, children);
    }

    const entry = this.cachedNodes.entry(kind, children);
    if (entry.value === undefined) {
      entry.value = new GreenNode(kind, children);
    }

    return entry.value;
  }

  /**
   * Create or retrieve a token of the given kind.
   *
   * @param {SyntaxKind} kind The kind for this token.
   * @param {string} text The backing text for this token.
   * @return {GreenToken} The resulting token.
   */
  public createToken(kind: SyntaxKind, text: string): GreenToken {
    const entry = this.cachedTokens.entry(kind, text);

    if (entry.value === undefined) {
      entry.value = new GreenToken(kind, text);
    }

    return entry.value;
  }
}
