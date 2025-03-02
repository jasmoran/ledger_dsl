import { Status } from "./status";
import { CostedAmount, ToCostedAmount } from "./costed_amount";
import { Comment, ToComment } from "./comment";

/**
 * Represents a posting in a financial transaction
 */
export class Posting {
  public account: string;
  public status: Status;
  #amount: CostedAmount | null = null;
  #balance: CostedAmount | null = null;
  #comment: Comment | null = null;
  #date: Date | null = null;
  #date2: Date | null = null;
  public tags: Map<string, string>;

  /**
   * @param account - The account name
   * @param status - The posting status. Default is Status.Unmarked.
   * @param amount - The amount of the posting. Default is null.
   * @param balance - The balance after the posting. Default is null.
   * @param comment - A comment for the posting. Default is null.
   * @param date - A date associated with the posting. Default is null.
   * @param date2 - A secondary date associated with the posting. Default is null.
   * @param tags - Additional tags for the posting.
   */
  constructor(
    account: string,
    {
      status = Status.Unmarked,
      amount = null,
      balance = null,
      comment = null,
      date = null,
      date2 = null,
      ...tags
    }: {
      status?: Status;
      amount?: ToCostedAmount | null;
      balance?: ToCostedAmount | null;
      comment?: ToComment | null;
      date?: Date | string | null;
      date2?: Date | string | null;
      [key: string]: any;
    } = {},
  ) {
    this.account = account;
    this.status = status;
    this.amount = amount;
    this.balance = balance;
    this.comment = comment;
    this.date = date;
    this.date2 = date2;
    this.tags = new Map(Object.entries(tags));
  }

  /**
   * Gets the amount of the posting.
   */
  public get amount(): CostedAmount | null {
    return this.#amount;
  }

  /**
   * Sets the amount of the posting.
   */
  public set amount(amount: ToCostedAmount | null) {
    this.#amount = amount === null ? null : new CostedAmount(amount);
  }

  /**
   * Gets the balance after the posting.
   */
  public get balance(): CostedAmount | null {
    return this.#balance;
  }

  /**
   * Sets the balance after the posting.
   */
  public set balance(balance: ToCostedAmount | null) {
    this.#balance = balance === null ? null : new CostedAmount(balance);
  }

  /**
   * Gets the comment for the posting.
   */
  public get comment(): Comment | null {
    return this.#comment;
  }

  /**
   * Sets the comment for the posting.
   */
  public set comment(comment: ToComment | null) {
    this.#comment = comment === null ? null : new Comment(comment);
  }

  /**
   * Gets the date associated with the posting.
   */
  public get date(): Date | null {
    return this.#date;
  }

  /**
   * Sets the date associated with the posting.
   */
  public set date(date: Date | string | null) {
    this.#date = date === null ? null : new Date(date);
  }

  /**
   * Gets the secondary date associated with the posting.
   */
  public get date2(): Date | null {
    return this.#date2;
  }

  /**
   * Sets the secondary date associated with the posting.
   */
  public set date2(date2: Date | string | null) {
    this.#date2 = date2 === null ? null : new Date(date2);
  }

  /**
   * Converts the posting to a ledger-formatted string.
   *
   * @param indent - The number of spaces to indent the posting.
   * @returns The formatted ledger string.
   */
  public toLedger(indent: number): string {
    let output = " ".repeat(indent);

    if (this.status === Status.Pending) {
      output += "! ";
    } else if (this.status === Status.Cleared) {
      output += "* ";
    }

    output += `${this.account} `;

    if (this.#amount) {
      output += ` ${this.#amount.toLedger()}`;
    }

    if (this.#balance) {
      output += ` = ${this.#balance.toLedger()}`;
    }

    const length = output.length + 1;

    const tags = new Map(this.tags);
    if (this.#date) {
      tags.set("date", this.#date.toISOString().split("T")[0]!);
    }
    if (this.#date2) {
      tags.set("date2", this.#date2.toISOString().split("T")[0]!);
    }

    const tagsStr = Array.from(tags.entries())
      .map(([key, value]) => `${key}:${value}`)
      .join(", ");

    if (tagsStr !== "") {
      output += ` ; ${tagsStr}`;
    }

    if (this.#comment) {
      const comment = this.#comment.toLedger(length);

      if (tagsStr === "") {
        output += ` ${comment.trimStart()}`;
      } else {
        output += `\n${comment}`;
      }
    }

    return output;
  }
}
