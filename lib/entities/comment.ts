/**
 * Types that can be converted to a comment.
 */
export type ToComment = Comment | string;

/**
 * A comment in a transaction or journal
 */
export class Comment {
  public readonly text: string;

  /**
   * @param comment - The comment to copy.
   */
  constructor(comment: Comment);
  /**
   * @param text - The comment text.
   */
  constructor(text: string);
  /**
   * @param toComment - The value to convert to a comment.
   */
  constructor(toComment: ToComment);
  constructor(a: ToComment) {
    if (a instanceof Comment) {
      this.text = a.text;
      return;
    }

    this.text = a;
  }

  /**
   * Converts the comment to a ledger-formatted string.
   *
   * @param indent - The number of spaces to indent.
   * @returns The formatted ledger string.
   */
  toLedger(indent: number): string {
    return this.text
      .split("\n")
      .map((line) => `${" ".repeat(indent)}; ${line.trim()}`)
      .join("\n");
  }
}
