import { SignJWT, importPKCS8 } from 'jose';
import { env } from '../../config/env';

const pem = Buffer.from(env.AUTH_PRIVATE_KEY, 'base64').toString('utf8');
const privateKey = await importPKCS8(pem, 'ES256');

export function signAccessToken(userId: string) {
   return new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: env.AUTH_KEY_ID })
      .setSubject(userId)
      .setIssuer(env.AUTH_ISSUER)
      .setAudience(env.AUTH_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
      .sign(privateKey);
}

export function generateRefreshToken() {
   return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url');
}