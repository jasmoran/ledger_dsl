import Decimal from "decimal.js";
import { Unit, EMPTY_UNIT, ToUnit } from "./unit";

/**
 * Types that can be converted to a value.
 */
export type ToValue = Decimal | number | string;

/**
 * Types that can be converted to an amount.
 */
export type ToAmount = Amount | ToValue;

/**
 * Represents an amount.
 */
export class Amount {
  static VALUE_UNIT_REGEX = /^([^0-9.-]*)([0-9.-]+)([^0-9.-]*)$/;

  #value: Decimal;
  #unit: Unit;

  /**
   * @param amount - The amount to copy.
   */
  constructor(amount: Amount);
  /**
   * @param value - The amount's value.
   * @param unit - The unit for the amount.
   */
  constructor(value: ToValue, unit?: ToUnit);
  /**
   * @param ToAmount - The value to convert to an amount.
   */
  constructor(toAmount: ToAmount);
  constructor(a: ToAmount, b: ToUnit | null = null) {
    // Clone another amount.
    if (a instanceof Amount) {
      this.#value = a.#value;
      this.#unit = a.#unit;
      return;
    }

    // Parse the value and unit from a string.
    if (typeof a === "string" && b === null) {
      const match = a.match(Amount.VALUE_UNIT_REGEX);
      if (match) {
        const prefix = match[1]?.trim() ?? "";
        const value = match[2]?.trim() ?? "";
        const suffix = match[3]?.trim() ?? "";
        if (prefix !== "" || suffix !== "") {
          this.#value = new Decimal(value);
          this.#unit = new Unit(prefix + suffix, 2, prefix !== "");
          return;
        }
      }
    }

    this.#value = new Decimal(a);
    this.#unit = new Unit(b ?? EMPTY_UNIT);
  }

  /**
   * Gets the value of the amount as a Decimal.
   */
  public get value(): Decimal {
    return this.#value;
  }

  /**
   * Sets the value of the amount.
   */
  public set value(newVal: ToValue) {
    this.#value = new Decimal(newVal);
  }

  /**
   * Gets the unit of the amount.
   */
  public get unit(): Unit {
    return this.#unit;
  }

  /**
   * Sets the unit of the amount.
   */
  public set unit(newUnit: ToUnit) {
    this.#unit = new Unit(newUnit);
  }

  /**
   * Converts the amount to a ledger-formatted string.
   *
   * @returns The formatted ledger string.
   */
  public toLedger(): string {
    const precision = this.#unit.precision;
    const formatted = this.#value.toFixed(precision);
    const symbol = this.#unit.symbol || "";
    return this.#unit.prefix
      ? `${symbol}${formatted}`
      : `${formatted} ${symbol}`;
  }
}
