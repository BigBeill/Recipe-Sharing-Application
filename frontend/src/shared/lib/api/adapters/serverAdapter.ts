import 'server-only';
import { cookies } from 'next/headers';
import type { TypeApiAdapter, TypePreparedRequest } from '../types';

// No `recover`. Refresh happens in middleware.ts, before render.
const serverAdapter: TypeApiAdapter = {
   async prepare(request: TypePreparedRequest) {
      const cookieHeader = (await cookies()).toString();
      if (cookieHeader) { request.headers['Cookie'] = cookieHeader; }
   },
};

export default serverAdapter;