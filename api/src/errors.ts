/**
 * Domain errors carrying the HTTP status the route layer should return.
 * Services throw these; routes translate them via the error middleware.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** 400 — invalid input caught at the service boundary. */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

/** 404 — referenced entity does not exist. */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message);
  }
}

/** 409 — the request conflicts with a business rule (full, double-book). */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}
