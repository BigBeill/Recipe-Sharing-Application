import { ErrorNotFound, ErrorUnauthorized } from './errorClasses';

export default async function parseResponse<T>(response: Response): Promise<T> {
   if (response.status === 204) { return undefined as T; }

   if (!response.ok) {
      const content = await response.json().catch(() => null);
      const message = content?.error?.message;

      if (response.status === 401) { throw new ErrorUnauthorized(message); }
      if (response.status === 404) { throw new ErrorNotFound(); }
      throw new Error(message ?? `Request failed with status ${response.status}`);
   }

   const payload = await response.json();
   return payload.data;
}