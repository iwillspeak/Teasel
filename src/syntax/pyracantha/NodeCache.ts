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
  private map: Map<number, MapEntry<K, V>[]>;

  public constructor(private hasher: Hasher<K>, private comparer: PartialEq<K>)
  {
    this.map = new Map<number, MapEntry<K, V>[]>();
  }

  public get(key: K): V | undefined {
    const hash = this.hasher(key);
    const bucket = this.map.get(hash);
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

  public set(key: K, value: V): void {
    const hash = this.hasher(key);
    let bucket = this.map.get(hash);
    if (bucket === undefined) {
      bucket = []
      this.map.set(hash, bucket);
    }

    bucket.push(new MapEntry(key, value));
  }
}

function djbCombine(hash: number, value: number) {
  return hash + (hash << 5) + value;
}

function djbMini(s: string) {
  let hash = 5381;
  for (const char of s) {
    hash = djbCombine(hash, char.charCodeAt(0));
  }
  return hash;
}

export class NodeCache {
  private size: number;

  private cachedTokens: CacheMap<[SyntaxKind, string], GreenToken>;
  private cachedNodes: CacheMap<[SyntaxKind, GreenElement[]], GreenNode>;

  public constructor(size: number | undefined) {
    if (size === undefined) {
      // TODO: tweak this for best caching tradeoff.
      size = 5;
    }

    this.size = size;
    this.cachedTokens = new CacheMap<[SyntaxKinds, string], GreenToken>(
      (k) => {
        let hash = 5381;
        hash = djbCombine(hash, k[0]);
        hash = djbCombine(hash, djbMini(k[1]));
        return hash;
      },
      (l, r) => l[0] === r[0] && l[1] === r[1]
    );
    this.cachedNodes = new CacheMap<[SyntaxKinds, GreenElement[]], GreenNode>(
      (k) => {
        let hash = 5381;
        hash = djbCombine(hash, k[0]);
        for (const element of k[1]) {
          hash = djbCombine(hash, element.hash);
        }
        return hash;
      },
      (l, r) => l[0] === r[0] && l[1].length === r[1].length && l[1].every((e, i) => e === r[1][i])
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

    // FIXME: caching of nodes.
    let found = this.cachedNodes.get([kind, children]);
    if (found === undefined) {
      found = new GreenNode(kind, children);
      this.cachedNodes.set([kind, children], found);
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
    const key: [SyntaxKind, string] = [kind, text];
    let cachedToken = this.cachedTokens.get(key);

    if (cachedToken === undefined) {
      cachedToken = new GreenToken(kind, text);
      this.cachedTokens.set(key, cachedToken);
    }

    return cachedToken;
  }
}
