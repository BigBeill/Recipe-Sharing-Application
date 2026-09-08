import buildRequest from './buildRequest';
import parseResponse from './parseResponse';
import type { TypeApiAdapter, TypeApiCaller, TypeApiRequestConfig } from './types';

export default function createApiCaller(adapter: TypeApiAdapter): TypeApiCaller {
   async function attempt<T>(config: TypeApiRequestConfig): Promise<T> {
      const request = buildRequest(config);
      await adapter.prepare(request, config);
      request.options.headers = request.headers;
      const response = await fetch(request.url, request.options);
      return parseResponse<T>(response);
   }

   return async function call<T>(config: TypeApiRequestConfig): Promise<T> {
      try {
         return await attempt<T>(config);
      }
      catch (error) {
         if (!adapter.recover) { throw error; }
         return adapter.recover<T>(error, config, () => attempt<T>(config));
      }
   };
}