import { Elysia } from 'elysia';

type RequestMeta = { id: string; start: number };
const meta = new WeakMap<Request, RequestMeta>();

export const logger = new Elysia({ name: 'logger' })
   .onRequest(({ request, set }) => {
      const id = crypto.randomUUID().slice(0, 8);
      meta.set(request, { id, start: performance.now() });
      set.headers['x-request-id'] = id;

      const path = new URL(request.url).pathname;
      console.log(`---> [${ id }] ${ request.method } ${ path } @ ${ formatTimestamp() }`);
   })
   .onError(({ request, code, error }) => {
      const m = meta.get(request);
      console.log(`\x1b[31m<-!- [${m?.id ?? '????'}] [${code}]\x1b[0m`, error);
   })
   .onAfterResponse(({ request, set }) => {
      const m = meta.get(request);
      const ms = m ? (performance.now() - m.start).toFixed(1) : '?';
      const path = new URL(request.url).pathname;
      console.log(`${ set.status?.toString()[0] === '2' ? '\x1b[32m' : '\x1b[33m' }<--- [${ m?.id ?? '????' }] ${ set.status ?? '' } ${ ms }ms ${ path }\x1b[0m`);
   })
   .as('global');



function formatTimestamp(date = new Date()): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
    pad(date.getMilliseconds(), 3),
  ].join(":");
}