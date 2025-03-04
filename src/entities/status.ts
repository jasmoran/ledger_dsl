export namespace Status {
  export const Unmarked = "";
  export const Cleared = "!";
  export const Pending = "*";
}
export type Status =
  | typeof Status.Unmarked
  | typeof Status.Cleared
  | typeof Status.Pending;
