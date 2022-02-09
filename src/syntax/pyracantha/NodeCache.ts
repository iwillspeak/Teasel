import {GreenElement} from './GreenTree.js';
import {GreenNode} from './GreenNode.js';
import {GreenToken} from './GreenToken.js';
import {SyntaxKind} from './Pyracantha.js';
import {SyntaxKinds} from '../../parse/Parser.js';

type Hasher<V> = (value: V) => number;
type PartialEq<V> = (left: V, right: V) => boolean;

class MapEntry<K, V> {
  public constructor(public key: K, public value: V)
  {}
}

class CacheMap<K, V> {
  private map: Map<SyntaxKind, Map<number, MapEntry<K, V>[]>>;

  public constructor(private hasher: Hasher<K>, private comparer: PartialEq<K>)
  {
    this.map = new Map<SyntaxKind, Map<number, MapEntry<K, V>[]>>();
  }

  public get(kind: SyntaxKind, key: K): V | undefined {
    const slab = this.map.get(kind);
    if (slab === undefined) {
      return undefined;
    }

    const hash = this.hasher(key);
    const bucket = slab.get(hash);
    if (bucket === undefined) {
      return undefined;
    }

    const entry = bucket.find((e) => {
      return this.comparer(e.key, key);
    });

    if (entry === undefined) {
      return undefined;
    }

    return entry.value;
  }

  public set(kind: SyntaxKind, key: K, value: V): void {
    let slab = this.map.get(kind);
    if (slab === undefined) {
      slab = new Map<number, MapEntry<K, V>[]>();
      this.map.set(kind, slab);
    }

    const hash = this.hasher(key);
    let bucket = slab.get(hash);
    if (bucket === undefined) {
      bucket = []
      slab.set(hash, bucket);
    } else if (bucket.length > 4) {
      bucket.unshift();
    }

    bucket.push(new MapEntry(key, value));
  }
}

function djbCombine(hash: number, value: number): number {
  return hash + (hash << 5) + value;
}

function djbCombineString(hash: number, s: string): number {
  for (const char of s) {
    hash = djbCombine(hash, char.charCodeAt(0));
  }
  return hash;
}

export class NodeCache {
  private size: number;

  private cachedTokens: CacheMap<string, GreenToken>;
  private cachedNodes: CacheMap<GreenElement[], GreenNode>;

  public constructor(size: number | undefined) {
    if (size === undefined) {
      // TODO: tweak this for best caching tradeoff.
      size = 5;
    }

    this.size = size;
    this.cachedTokens = new CacheMap<string, GreenToken>(
      (k) => {
        let hash = 5381;
        hash = djbCombineString(hash, k);
        return hash;
      },
      (l, r) => l === r
    );
    this.cachedNodes = new CacheMap<GreenElement[], GreenNode>(
      (k) => {
        let hash = 5381;
        for (const element of k) {
          hash = djbCombine(hash, element.hash);
        }
        return hash;
      },
      (l, r) => l.length === r.length && l.every((e, i) => e === r[i])
    );
  }

  /**
   * Create or retrieve a node of the given kind with the given children.
   *
   * @param kind The kind for this node.
   * @param children The children for this node.
   */
  public createNode(kind: number, children: GreenElement[]): GreenNode {
    if (children.length > this.size) {
      return new GreenNode(kind, children);
    }

    let found = this.cachedNodes.get(kind, children);
    if (found === undefined) {
      found = new GreenNode(kind, children);
      this.cachedNodes.set(kind, children, found);
    }

    return found;
  }

  /**
   * Create or retrieve a token of the given kind.
   *
   * @param kind The kind for this token.
   * @param text The backing text for this token.
   */
  public createToken(kind: SyntaxKind, text: string): GreenToken {
    let cachedToken = this.cachedTokens.get(kind, text);

    if (cachedToken === undefined) {
      cachedToken = new GreenToken(kind, text);
      this.cachedTokens.set(kind, text, cachedToken);
    }

    return cachedToken;
  }
}
