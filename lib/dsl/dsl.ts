import { Comment, ToComment } from "../entities/comment";
import { ToCostedAmount } from "../entities/costed_amount";
import { Journal } from "../entities/journal";
import { Posting } from "../entities/posting";
import { Status } from "../entities/status";
import { Transaction } from "../entities/transaction";

type TransactionBlock = (transaction: TransactionDSL) => void;
type PostingBlock = (posting: Posting) => void;

class TransactionDSL extends Transaction {
  /**
   * Adds a posting to the transaction.
   *
   * @param account - The account name
   * @param status - The posting status. Default is Status.Unmarked.
   * @param amount - The amount of the posting. Default is null.
   * @param balance - The balance after the posting. Default is null.
   * @param comment - A comment for the posting. Default is null.
   * @param date - A date associated with the posting. Default is null.
   * @param date2 - A secondary date associated with the posting. Default is null.
   * @param tags - Additional tags for the posting.
   */
  posting(
    account: string,
    status?: Status,
    amount?: ToCostedAmount | null,
    balance?: ToCostedAmount | null,
    comment?: ToComment | null,
    date?: Date | string | null,
    date2?: Date | string | null,
    tags?: Record<string, string>,
  ): Posting;
  /**
   * Adds a posting to the transaction.
   *
   * @param account - The account name
   * @param block - Function that builds the posting.
   */
  posting(account: string, block: PostingBlock): Posting;
  posting(
    account: string,
    statusOrBlock: Status | PostingBlock = Status.Unmarked,
    amount: ToCostedAmount | null = null,
    balance: ToCostedAmount | null = null,
    comment: ToComment | null = null,
    date: Date | string | null = null,
    date2: Date | string | null = null,
    tags: Record<string, string> = {},
  ): Posting {
    if (typeof statusOrBlock === "function") {
      const posting = new Posting(account);
      this.addEntry(posting);
      statusOrBlock(posting);
      return posting;
    }
    const posting = new Posting(
      account,
      statusOrBlock,
      amount,
      balance,
      comment,
      date,
      date2,
      tags,
    );
    this.addEntry(posting);
    return posting;
  }

  public p = this.posting;
  public po = this.posting;

  /**
   * Adds a comment to the transaction.
   *
   * @param comment - The comment to copy.
   */
  comment(comment: Comment): Comment;
  /**
   * Adds a comment to the transaction.
   *
   * @param text - The comment text.
   */
  comment(text: string): Comment;
  /**
   * Adds a comment to the transaction.
   *
   * @param toComment - The value to convert to a comment.
   */
  comment(toComment: ToComment): Comment;
  comment(a: ToComment): Comment {
    const comment = new Comment(a);
    this.addEntry(comment);
    return comment;
  }

  public c = this.comment;
  public co = this.comment;
}

class JournalDSL extends Journal {
  /**
   * Adds a transaction to the journal.
   *
   * @param date - The date of the transaction.
   * @param status - The status of the transaction.
   * @param code - The code of the transaction.
   * @param payee - The payee of the transaction.
   * @param note - The note of the transaction.
   * @param tags - The tags of the transaction.
   * @returns The new transaction.
   */
  transaction(
    date: Date | string,
    status?: Status,
    code?: string | null,
    payee?: string | null,
    note?: string | null,
    tags?: Map<string, string>,
  ): Transaction;
  /**
   * Adds a transaction to the journal.
   *
   * @param date - The date of the transaction.
   * @param block - Function that builds the transaction.
   * @returns The new transaction.
   */
  transaction(date: Date | string, block: TransactionBlock): Transaction;
  transaction(
    date: Date | string,
    statusOrBlock: Status | TransactionBlock = Status.Unmarked,
    code: string | null = null,
    payee: string | null = null,
    note: string | null = null,
    tags: Map<string, string> = new Map(),
  ): Transaction {
    if (typeof statusOrBlock === "function") {
      const transaction = new TransactionDSL(date);
      this.addEntry(transaction);
      statusOrBlock(transaction);
      return transaction;
    }
    const transaction = new TransactionDSL(
      date,
      statusOrBlock,
      code,
      payee,
      note,
      tags,
    );
    this.addEntry(transaction);
    return transaction;
  }

  public t = this.transaction;
  public tr = this.transaction;

  /**
   * Adds a comment to the journal.
   *
   * @param comment - The comment to copy.
   */
  comment(comment: Comment): Comment;
  /**
   * Adds a comment to the journal.
   *
   * @param text - The comment text.
   */
  comment(text: string): Comment;
  /**
   * Adds a comment to the journal.
   *
   * @param toComment - The value to convert to a comment.
   */
  comment(toComment: ToComment): Comment;
  comment(a: ToComment): Comment {
    const comment = new Comment(a);
    this.addEntry(comment);
    return comment;
  }

  public c = this.comment;
  public co = this.comment;
}

export function journal(block: (journal: JournalDSL) => void): Journal {
  const journal = new JournalDSL();
  block(journal);
  return journal;
}
export const j = journal;
export const jo = journal;
