// src/auth/jwks.plugin.ts
import { Elysia } from 'elysia';
import { publicJwk } from './keys';

export const jwksPlugin = new Elysia({ name: 'jwks' })
   .get('/.well-known/jwks.json', ({ set }) => {
      set.headers['cache-control'] = 'public, max-age=3600';
      return { keys: [publicJwk] };
   });