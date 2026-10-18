import type { StringValue } from 'ms';

function required(name: string): string {
	const v = process.env[name];
	if (!v) throw new Error(`Missing env var: ${name}`);
	return v;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}


export const env = {
	PORT: required('PORT'),
	FRONTEND_URLS: required('FRONTEND_URLS'),
	NODE_ENVIRONMENT: required('NODE_ENVIRONMENT'),

	MONGOOSE_URL: required('MONGOOSE_URL'),

	POSTGRES_DB: required('POSTGRES_DB'),
	POSTGRES_HOST: required('POSTGRES_HOST'),
	POSTGRES_USER: required('POSTGRES_USER'),
	POSTGRES_PASSWORD: required('POSTGRES_PASSWORD'),
	POSTGRES_PORT: Number(required('POSTGRES_PORT')),

	BUCKET_URL: required('BUCKET_URL'),
	BUCKET_REGION: required('BUCKET_REGION'),
	BUCKET_NAME: required('BUCKET_NAME'),
	BUCKET_ACCESS_KEY_ID: required('BUCKET_ACCESS_KEY_ID'),
	BUCKET_SECRET_ACCESS_KEY: required('BUCKET_SECRET_ACCESS_KEY'),

	JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
	JWT_ACCESS_EXPIRES_IN: required('JWT_ACCESS_EXPIRES_IN') as StringValue,
	JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
	JWT_REFRESH_EXPIRES_IN: required('JWT_REFRESH_EXPIRES_IN') as StringValue,

	RESEND_API_KEY: required('RESEND_API_KEY'),

	AUTH_PRIVATE_KEY: required('AUTH_PRIVATE_KEY'),
	AUTH_PUBLIC_JWK: required('AUTH_PUBLIC_JWK'),
	AUTH_KEY_ID: required('AUTH_KEY_ID'),
	AUTH_ISSUER: required('AUTH_ISSUER'),
	AUTH_AUDIENCE: required('AUTH_AUDIENCE'),

	COOKIE_DOMAIN: optional('COOKIE_DOMAIN'),
};