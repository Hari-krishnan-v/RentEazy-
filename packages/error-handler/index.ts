export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode: number, isOperational = true, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, true, details);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, true, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: any) {
    super(message, 403, true, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 500, false, details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable', details?: any) {
    super(message, 503, false, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', details?: any) {
    super(message, 409, true, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation error', details?: any) {
    super(message, 422, true, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', details?: any) {
    super(message, 429, true, details);
  }
}

export class NotImplementedError extends AppError {
  constructor(message: string = 'Not implemented', details?: any) {
    super(message, 501, false, details);
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message: string = 'Gateway timeout', details?: any) {
    super(message, 504, false, details);
  }
}


