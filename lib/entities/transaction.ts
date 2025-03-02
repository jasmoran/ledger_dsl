import { Comment } from "./comment";
import { Posting } from "./posting";
import { Status } from "./status";

/**
 * Represents a transaction.
 */
export class Transaction {
  #date: Date;
  public status: Status = Status.Unmarked;
  public code: string | null = null;
  public payee: string | null = null;
  public note: string | null = null;
  public tags: Map<string, string>;
  #entries: Array<Posting | Comment>;

  constructor(
    date: Date | string,
    status: Status = Status.Unmarked,
    code: string | null = null,
    payee: string | null = null,
    note: string | null = null,
    tags: Map<string, string> = new Map(),
  ) {
    this.#date = new Date(date);
    this.status = status;
    this.code = code;
    this.payee = payee;
    this.note = note;
    this.tags = tags;
    this.#entries = [];
  }

  /**
   * Sets the date of the transaction.
   */
  public set date(date: Date) {
    this.#date = new Date(date);
  }

  /**
   * Gets the date of the transaction.
   */
  public get date(): Date {
    return this.#date;
  }

  /**
   * Add an entry to the transaction.
   */
  public addEntry(entry: Posting | Comment): void {
    this.#entries.push(entry);
  }

  /**
   * Converts the transaction to a ledger-formatted string.
   *
   * @returns The formatted ledger string.
   */
  public toLedger(): string {
    let output = `${this.#date.toISOString().split("T")[0]}`;

    if (this.status === Status.Pending) {
      output += "! ";
    } else if (this.status === Status.Cleared) {
      output += "* ";
    }

    if (this.code) {
      output += ` (${this.code})`;
    }
    if (this.payee) {
      output += ` ${this.payee}`;
    }
    if (this.note) {
      output += ` | ${this.note}`;
    }

    const tagsStr = Array.from(this.tags.entries())
      .map(([key, value]) => `${key}:${value}`)
      .join(", ");
    if (tagsStr !== "") {
      output += ` ; ${tagsStr}`;
    }

    output += "\n";
    output += this.#entries.map((entry) => entry.toLedger(4)).join("\n");

    return output;
  }
}
