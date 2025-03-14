import { Transaction } from "./transaction";
import { Comment } from "./comment";

/**
 * Represents a collection of financial transactions.
 */
export class Journal {
  #entries: (Transaction | Comment)[];

  constructor(entries: Array<Transaction | Comment> = []) {
    this.#entries = [...entries];
  }

  /**
   * Adds an entry to the journal.
   */
  protected addEntry(entry: Transaction | Comment): void {
    this.#entries.push(entry);
  }

  /**
   * Converts the journal entries to a ledger-formatted string.
   *
   * @returns The formatted ledger string.
   */
  public toLedger(): string {
    return this.#entries.map((entry) => entry.toLedger(0)).join("\n\n");
  }
}
