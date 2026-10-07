import { ErrorNotFound, ErrorUnauthorized, ErrorValidation } from '../../domain/errorClasses';

export default async function parseResponse<T>(response: Response): Promise<T> {
   if (response.status === 204) { return undefined as T; }

   if (!response.ok) {
      const content = await response.json().catch(() => null);

      const badResponse = {
         status: response.status,
         name: content?.name,
         code: content?.code,
         message: content?.message,
      }

      if (response.status === 400) { throw new ErrorValidation('Server rejected the request', content?.rejectedFieldList || [], { cause: badResponse }); }
      else if (response.status === 401) { throw new ErrorUnauthorized('Unauthorized response from server', { cause: badResponse }); }
      else if (response.status === 404) { throw new ErrorNotFound('Resource not found', { cause: badResponse }); }
      else { throw new Error(`Request failed with status ${response.status}`, { cause: badResponse  }); };
   }

   const payload = await response.json();
   return payload.data;
}