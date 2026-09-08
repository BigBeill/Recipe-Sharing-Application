import type { TypeApiRequestConfig, TypePreparedRequest } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const NO_BODY_METHODS = new Set(['get', 'head', 'delete']);

export default function buildRequest(config: TypeApiRequestConfig): TypePreparedRequest {
   const method = config.method.toLowerCase();
   const hasBody = !NO_BODY_METHODS.has(method);
   const body = config.body;
   const isFormData = body instanceof FormData;

   let url = `${BASE_URL}${config.url}`;

   if (!hasBody && body && !isFormData) {
      const query = new URLSearchParams(
         Object.entries(body)
            .filter(([, value]) => value != null)
            .map(([key, value]) => [key, String(value)])
      ).toString();
      if (query) { url += `?${query}`; }
   }

   const headers: Record<string, string> = {};
   if (!isFormData) { headers['Content-Type'] = 'application/json'; }

   const options: RequestInit = { method: config.method };
   if (hasBody && body) {
      options.body = isFormData ? body : JSON.stringify(body);
   }

   return { url, headers, options };
}