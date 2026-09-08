import 'client-only';
import buildRequest from '../buildRequest';
import parseResponse from '../parseResponse';
import { ErrorUnauthorized } from '../errorClasses';
import type { TypeApiAdapter, TypeApiRequestConfig, TypePreparedRequest } from '../types';

const NO_REFRESH_URLS = new Set(['/auth/login', '/auth/register', '/auth/refresh']);

let refreshPromise: Promise<void> | null = null;

function refresh(): Promise<void> {
   if (!refreshPromise) {
      refreshPromise = (async () => {
         const request = buildRequest({ method: 'post', url: '/auth/refresh' });
         request.options.credentials = 'include';
         request.options.headers = request.headers;
         await parseResponse<void>(await fetch(request.url, request.options));
      })().finally(() => { refreshPromise = null; });
   }
   return refreshPromise;
}

const clientAdapter: TypeApiAdapter = {
   prepare(request: TypePreparedRequest) {
      request.options.credentials = 'include';
   },

   async recover<T>(error: unknown, config: TypeApiRequestConfig, retry: () => Promise<T>): Promise<T> {
      const skip = NO_REFRESH_URLS.has(config.url);
      if (!(error instanceof ErrorUnauthorized) || skip) { throw error; }

      try { await refresh(); }
      catch { throw error; }

      return retry();
   },
};

export default clientAdapter;