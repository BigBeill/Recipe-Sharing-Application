import { t } from "elysia";

export const requestPasswordResetValidator = t.Object({
   email: t.String({ format: "email", maxLength: 256 }),
});