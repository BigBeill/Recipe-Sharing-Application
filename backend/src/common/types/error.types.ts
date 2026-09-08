
export class AppError extends Error {
   constructor(
      public override message: string,
      public statusCode: number = 500,
      public code: string = 'INTERNAL_ERROR',
   ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
   }
}

export class NotFoundError extends AppError {
   constructor(resource: string) {
      super(`${resource} not found`, 404, 'NOT_FOUND');
   }
}

export class UnauthorizedError extends AppError {
   constructor(message: string = 'Unauthorized Access') {
      super(message, 401, 'UNAUTHORIZED');
   }
}

export class ValidationError extends AppError {
   constructor(message: string) {
      super(message, 400, 'VALIDATION_ERROR');
   }
}

export class ConflictError extends AppError {
   constructor(message: string) {
      super(message, 409, 'CONFLICT');
   }
}