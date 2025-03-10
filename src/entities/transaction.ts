import { formatDate } from "../ledger/date";
import { Comment } from "./comment";
import { Posting } from "./posting";
import { Status } from "./status";

/**
 * Represents a transaction.
 */
export class Transaction {
  #date: Date;
  #date2: Date | null = null;
  public status: Status = Status.Unmarked;
  public code: string | null = null;
  public payee: string | null = null;
  public note: string | null = null;
  public tags: Map<string, string> = new Map();
  #entries: Array<Posting | Comment>;

  constructor(
    date: Date | string,
    status?: Status,
    code?: string | null,
    payee?: string | null,
    note?: string | null,
    date2?: Date | null,
    tags?: Record<string, string>,
  );
  constructor(date: Date | string, entries: Array<Posting | Comment>);
  constructor(
    date: Date | string,
    statusOrEntries: Status | Array<Posting | Comment> = Status.Unmarked,
    code: string | null = null,
    payee: string | null = null,
    note: string | null = null,
    date2: Date | null = null,
    tags: Record<string, string> = {},
  ) {
    this.#date = new Date(date);
    this.date2 = date2;
    this.code = code;
    this.payee = payee;
    this.note = note;
    this.tags = new Map(Object.entries(tags));

    if (Array.isArray(statusOrEntries)) {
      this.status = Status.Unmarked;
      this.#entries = [...statusOrEntries];
      return;
    }
    this.status = statusOrEntries;
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
   * Gets the secondary date associated with the transaction.
   */
  public get date2(): Date | null {
    return this.#date2;
  }

  /**
   * Sets the secondary date associated with the transaction.
   */
  public set date2(date2: Date | string | null) {
    this.#date2 = date2 === null ? null : new Date(date2);
  }

  /**
   * Add an entry to the transaction.
   */
  protected addEntry(entry: Posting | Comment): void {
    this.#entries.push(entry);
  }

  /**
   * Converts the transaction to a ledger-formatted string.
   *
   * @returns The formatted ledger string.
   */
  public toLedger(): string {
    let output = formatDate(this.#date);

    if (this.#date2) {
      output += `=${formatDate(this.#date2)}`;
    }

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
