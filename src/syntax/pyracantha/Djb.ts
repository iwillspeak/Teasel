const DJB_INIT = 5381;
const MAX_POOLED_HAHSERS = 100;

export class Djb {
  private hash: number;

  private static pool: Djb[] = [];

  public constructor() {
    this.hash = DJB_INIT;
  }

  /**
   * Get the current value of the hash code in this hasher.
   */
  public finish(): number {
    return this.hash;
  }

  /**
   * Write a number into the hash.
   *
   * @param value The value to combine.
   */
  public writeNumber(value: number): void {
    this.hash = this.hash + (this.hash << 5) + value;
  }

  /**
   * Write a string value into the hash.
   *
   * @param s The string to add.
   */
  public writeString(value: string): void {
    for (let i = 0; i < value.length && i < 50; i++) {
      this.writeNumber(value.charCodeAt(i));
    }
  }

  /**
   * Re-initialise the hasher.
   */
  private reset(): void {
    this.hash = DJB_INIT;
  }

  /**
   * Get a pooled hasher.
   *
   * @return A pooled builder, or a new one if none available.
   */
  public static getPooled(): Djb {
    const found = this.pool.pop();
    if (found !== undefined) {
      found.reset();
      return found;
    }

    return new Djb();
  }

  /**
   *
   * @param hasher The hasher to return to the pool.
   */
  public static returnPooled(hasher: Djb): void {
    if (this.pool.length < MAX_POOLED_HAHSERS) {
      this.pool.push(hasher);
    }
  }
}
