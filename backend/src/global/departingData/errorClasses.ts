
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

export class AppErrorNotFound extends AppError {
   constructor(resource?: string) {
      super(`${ resource ?? "resource" } not found`, 404, 'NOT_FOUND');
   }
}

export class AppErrorUnauthorized extends AppError {
   constructor() {
      super("client does not have access to requested resources", 401, 'UNAUTHORIZED');
   }
}

export class AppErrorConflict extends AppError {
   constructor(resource: string) {
      super(`${ resource } has already been taken`, 409, 'CONFLICT');
   }
}