class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    // true = an expected error we deliberately threw;
    // false = an unexpected bug. We hide bug details from users in production.
    this.isOperational = isOperational;
    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;