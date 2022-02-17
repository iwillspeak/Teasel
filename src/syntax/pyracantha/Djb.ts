const DJB_INIT = 5381;

export class Djb {
  private hash: number;

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
  public writeString(value: string) {
    for (let i = 0; i < value.length && i < 50; i++) {
      this.writeNumber(value.charCodeAt(i));
    }
  }
}
