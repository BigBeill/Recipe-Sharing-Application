// src/auth/keys.ts
import { importPKCS8, importJWK } from 'jose';
import { env } from '../../config/env';

const pem = Buffer.from(process.env.AUTH_PRIVATE_KEY!, 'base64').toString('utf8');

export const KEY_ID = process.env.AUTH_KEY_ID!;
export const privateKey = await importPKCS8(pem, 'ES256');
export const publicKey = await importJWK(JSON.parse(env.AUTH_PUBLIC_JWK), 'ES256')

export const publicJwk = {
   ...JSON.parse(process.env.AUTH_PUBLIC_JWK!),
   kid: KEY_ID, use: 'sig', alg: 'ES256',
};