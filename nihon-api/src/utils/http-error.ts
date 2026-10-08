/** An expected failure that maps directly to an HTTP response. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details: Record<string, unknown> = {}
  ) {
    super(message);
  }

  get body() {
    return { message: this.message, ...this.details };
  }
}
