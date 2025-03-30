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

  /**
   * Sorts the journal entries by date.
   * Places comments at the top of the journal.
   * Transactions are sorted by date, then code, then note.
   */
  public sort(): void {
    this.#entries.sort((a, b) => {
      if (a instanceof Comment && b instanceof Comment) {
        return 0;
      } else if (a instanceof Comment) {
        return -1;
      } else if (b instanceof Comment) {
        return 1;
      }

      return (
        a.date.getTime() - b.date.getTime() ||
        a.code?.localeCompare(b.code || "") ||
        a.note?.localeCompare(b.note || "") ||
        0
      );
    });
  }
}
