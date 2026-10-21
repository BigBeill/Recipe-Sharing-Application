import { t } from "elysia";

export const LoginValidator = t.Object({
   name: t.String({ minLength: 6, maxLength: 256 }),
   password: t.String({ minLength:6, maxLength: 256 }),
   rememberMe: t.Boolean()
});