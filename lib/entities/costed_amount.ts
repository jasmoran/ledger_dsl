import { Amount, ToAmount, ToValue } from "./amount";
import { EMPTY_UNIT, ToUnit } from "./unit";

/**
 * Type of cost.
 */
export enum CostType {
  None = "None",
  Total = "Total",
  Unit = "Unit",
}

/**
 * Types that can be converted to a costed amount.
 */
export type ToCostedAmount = CostedAmount | ToAmount;

/**
 * Represents an amount with an optional associated cost.
 */
export class CostedAmount {
  static COSTED_AMOUNT_REGEX = /^(.*)(@@?)(.*)$/;

  #amount: Amount;
  #type: CostType;
  #cost: Amount | null;

  /**
   * @param costedAmount - The costed amount to copy.
   */
  constructor(costedAmount: CostedAmount);
  /**
   * @param amount - The base amount.
   * @param cost - The optional cost.
   * @param type - The type of cost. Default is CostType.None.
   */
  constructor(amount: ToAmount, cost?: ToAmount | null, type?: CostType);
  /**
   * @param toCostedAmount - The value to convert to a costed amount.
   */
  constructor(toCostedAmount: ToCostedAmount);
  constructor(
    a: ToCostedAmount,
    b: ToAmount | null = null,
    c: CostType | null = null,
  ) {
    // Clone another costed amount.
    if (a instanceof CostedAmount) {
      this.#amount = a.#amount;
      this.#type = a.#type;
      this.#cost = a.#cost;
      return;
    }

    // Extract cost and type from a string amount
    if (typeof a === "string" && b === null && c === null) {
      const match = a.match(CostedAmount.COSTED_AMOUNT_REGEX);
      if (match) {
        this.#amount = new Amount(match[1]!.trim());
        this.#type = match[2] === "@" ? CostType.Unit : CostType.Total;
        this.#cost = new Amount(match[3]!.trim());
        return;
      }
    }

    this.#amount = new Amount(a);
    this.#type = c ?? CostType.None;
    this.#cost = b === null ? null : new Amount(b);
  }

  /**
   * Gets the base amount.
   */
  public get amount(): Amount {
    return this.#amount;
  }

  /**
   * Sets the base amount.
   */
  public set amount(amount: ToAmount) {
    this.#amount = new Amount(amount);
  }

  /**
   * Gets the cost amount, if any.
   */
  public get cost(): Amount | null {
    return this.#cost;
  }

  /**
   * Sets the cost amount.
   */
  public set cost(cost: ToAmount | null) {
    this.#cost = cost === null ? null : new Amount(cost);
  }

  /**
   * Gets the cost type.
   */
  public get type(): CostType {
    return this.#type;
  }

  /**
   * Sets the cost type.
   */
  public set type(type: CostType) {
    this.#type = type;
  }

  /**
   * Sets a total cost for this amount.
   *
   * @param amount - The cost amount.
   * @returns This CostedAmount for chaining.
   */
  public totalCost(amount: Amount): CostedAmount;
  /**
   * Sets a total cost for this amount.
   *
   * @param value - The cost value.
   * @param unit - The unit for the cost.
   * @returns This CostedAmount for chaining.
   */
  public totalCost(value: ToValue, unit: ToUnit): CostedAmount;
  public totalCost(a: ToAmount, b: ToUnit = EMPTY_UNIT): CostedAmount {
    this.#cost = a instanceof Amount ? a : new Amount(a, b);
    this.#type = CostType.Total;
    return this;
  }

  /**
   * Sets a per-unit cost for this amount.
   *
   * @param amount - The cost amount.
   */
  public unitCost(amount: Amount): CostedAmount;
  /**
   * Sets a per-unit cost for this amount.
   *
   * @param value - The cost value.
   * @param unit - The unit for the cost.
   * @returns This CostedAmount for chaining.
   */
  public unitCost(value: ToValue, unit: ToUnit): CostedAmount;
  public unitCost(a: ToAmount, b: ToUnit = EMPTY_UNIT): CostedAmount {
    this.#cost = a instanceof Amount ? a : new Amount(a, b);
    this.#type = CostType.Unit;
    return this;
  }

  /**
   * Converts the costed amount to a ledger-formatted string.
   *
   * @returns The formatted ledger string.
   */
  public toLedger(): string {
    const amount = this.#amount.toLedger();
    if (this.#cost) {
      const cost = this.#cost.toLedger();
      if (this.#type === CostType.Unit) {
        return `${amount} @ ${cost}`;
      } else {
        return `${amount} @@ ${cost}`;
      }
    } else {
      return amount;
    }
  }
}
