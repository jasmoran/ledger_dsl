export type ToUnit = Unit | string | null;

/**
 * Represents units of amount.
 */
export class Unit {
  /**
   * The symbol representing the unit.
   */
  public readonly symbol: string | null;
  /**
   * The number of decimal places.
   */
  public readonly precision: number;
  /**
   * Indicates if the symbol should be prefixed.
   */
  public readonly prefix: boolean;

  /**
   * @param unit - The unit to copy.
   */
  constructor(unit: Unit);
  /**
   * @param symbol - The symbol representing the unit (nullable). Default is null.
   * @param precision - The number of decimal places. Default is 2.
   * @param prefix - Indicates if the symbol is prefixed. Default is true.
   */
  constructor(symbol?: string | null, precision?: number, prefix?: boolean);
  /**
   * @param toUnit - The value to convert to a unit.
   */
  constructor(toUnit: ToUnit);
  constructor(a: ToUnit = null, b: number = 2, c: boolean = true) {
    // Clone another unit.
    if (a instanceof Unit) {
      this.symbol = a.symbol;
      this.precision = a.precision;
      this.prefix = a.prefix;
      return;
    }

    this.symbol = a;
    this.precision = b;
    this.prefix = c;
  }
}

/**
 * The empty unit.
 */
export const EMPTY_UNIT = new Unit();
