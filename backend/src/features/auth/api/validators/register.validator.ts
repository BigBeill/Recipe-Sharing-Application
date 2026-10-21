import { t } from "elysia";

export const RegisterValidator = t.Object({
   name: t.String({ minLength: 6, maxLength: 256 }),
   email: t.String({ format: 'email', maxLength: 256}),
   password: t.String({ minLength: 6, maxLength: 256 }),
});