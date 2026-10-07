import { Elysia, ValidationError } from 'elysia';
import { AppError } from '../common/types/error.types';

export const errorHandler = new Elysia({ name: 'error-handler' })
   .onError(({ error, code, set }) => {

      if (error instanceof AppError) {
         set.status = error.statusCode;
         return {
            name: error.name,
            code: error.code,
            message: error.message,
         }
      }

      else if (error instanceof ValidationError) {
         const grouped = new Map<string, string[]>();

         for (const valueError of error.all) {
            if (!('path' in valueError)) { continue; }
            const field = valueError.path.slice(1).replaceAll('/', '.') || 'root';
            const reasonList = grouped.get(field) ?? [];
            reasonList.push(valueError.message);
            grouped.set(field, reasonList);
         }

         set.status = 400;
         return {
            name: 'Validation Error',
            code: 'ERROR_VALIDATION',
            message: 'Some fields are missing or invalid.',
            rejectedFieldList: [...grouped].map(([field, reasonList]) => ({ field, reasonList }))
         }
      }

      if (code === 'NOT_FOUND') {
         set.status = 404;
         return {
            name: 'Not Found Error',
            code: 'ERROR_NOT_FOUND',
            message: 'Server reached, requested resource could not be found'
         }
      }

      console.error('Unhandled error:', error);
      set.status = 500;
      return { 
         name: 'Uncaught internal error',
         code: 'ERROR_INTERNAL', 
         message: 'Something went wrong' 
      }
   })
      .as('global');