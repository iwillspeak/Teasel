const DJB_INIT = 5381;
const MAX_POOLED_HAHSERS = 100;

/**
 * DJB Hasher
 *
 * This class implements the DJB hash function. This is a simple string hash
 * with a good performance to collision trade off for our use case.
 */
export class Djb {
  private hash: number;

  private static pool: Djb[] = [];

  public constructor() {
    this.hash = DJB_INIT;
  }

  /**
   * Get the current value of the hash code in this hasher.
   *
   * @return {number} The final hash code.
   */
  public finish(): number {
    return this.hash;
  }

  /**
   * Write a number into the hash.
   *
   * @param {number} value The value to combine.
   */
  public writeNumber(value: number): void {
    this.hash = this.hash + (this.hash << 5) + value;
  }

  /**
   * Write a string value into the hash.
   *
   * @param {string} value The string to add.
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
   * @return {Djb} A pooled builder, or a new one if none available.
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
   * Return a hahser to the global pool.
   *
   * Once returned the hasher is made availabel to callers of {@link getPooled}.
   * It is an error to continue using the hasher once reutrned to the pool.
   *
   * @param {Djb} hasher The hasher to return to the pool.
   */
  public static returnPooled(hasher: Djb): void {
    if (this.pool.length < MAX_POOLED_HAHSERS) {
      this.pool.push(hasher);
    }
  }
}
