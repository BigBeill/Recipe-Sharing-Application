import { Elysia, ValidationError } from 'elysia';
import { AppError } from '../common/types/error.types';

export const errorHandler = new Elysia({ name: 'error-handler' })
   .onError(({ error, code, set }) => {
      if (error instanceof AppError) {
         set.status = error.statusCode;
         return { error: { code: error.code, message: error.message } };
      }

      else if (error instanceof ValidationError) {
         set.status = 400;
         const message = JSON.parse(error.message);
         return { error: { code: 'VALIDATION_ERROR', message } };
      }

      if (code === 'NOT_FOUND') {
         set.status = 404;
         return { error: { code: 'NOT_FOUND', message: 'Resource not found' } };
      }

      console.error('Unhandled error:', error);
      set.status = 500;
      return { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } };
   })
      .as('global');