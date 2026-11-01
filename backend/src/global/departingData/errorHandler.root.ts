import { Elysia, ValidationError } from 'elysia';
import { AppError } from './errorClasses';

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
         const rejectedFieldList = error.all.flatMap((error) =>
            'path' in error
               ? [{ field: error.path.slice(1) || 'root', reasonList: [error.message] }]
               : []
         )
         return {
            name: error.name,
            code: error.code,
            message: `Validation rejected by { ${error.type} }`,
            reasonList: rejectedFieldList,
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