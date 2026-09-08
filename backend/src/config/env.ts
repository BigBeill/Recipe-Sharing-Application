import type { StringValue } from 'ms';

function required(name: string): string {
	const v = process.env[name];
	if (!v) throw new Error(`Missing env var: ${name}`);
	return v;
}

export const env = {
	PORT: required('PORT'),
	NODE_ENVIRONMENT: required('NODE_ENVIRONMENT'),

	CORS_ORIGIN: required('CORS_ORIGIN'),

	MONGOOSE_URL: required('MONGOOSE_URL'),

	POSTGRES_DB_HOST: required('POSTGRES_DB_HOST'),
	POSTGRES_DB_USER: required('POSTGRES_DB_USER'),
	POSTGRES_DB_DATABASE: required('POSTGRES_DB_DATABASE'),
	POSTGRES_DB_PASSWORD: required('POSTGRES_DB_PASSWORD'),
	POSTGRES_DB_PORT: Number(required('POSTGRES_DB_PORT')),

	JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
	JWT_ACCESS_EXPIRES_IN: required('JWT_ACCESS_EXPIRES_IN') as StringValue,
	JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
	JWT_REFRESH_EXPIRES_IN: required('JWT_REFRESH_EXPIRES_IN') as StringValue,

	UPLOADS_DIRECTORY: required('UPLOADS_DIRECTORY'),

	RESEND_API_KEY: required('RESEND_API_KEY'),

	AUTH_PRIVATE_KEY: required('AUTH_PRIVATE_KEY'),
	AUTH_PUBLIC_JWK: required('AUTH_PUBLIC_JWK'),
	AUTH_KEY_ID: required('AUTH_KEY_ID'),
	AUTH_ISSUER: required('AUTH_ISSUER'),
	AUTH_AUDIENCE: required('AUTH_AUDIENCE')
};