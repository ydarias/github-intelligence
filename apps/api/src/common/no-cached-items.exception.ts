export class NoCachedItemsException extends Error {
  static readonly MESSAGE = "No cached issues found. Run the CLI first.";

  constructor() {
    super(NoCachedItemsException.MESSAGE);
    this.name = "NoCachedItemsException";
  }
}
