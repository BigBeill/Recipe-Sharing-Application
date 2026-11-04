import { t } from "elysia";

export const ValidatorIncomingAuthRequestPasswordResetBody = t.Object({
   email: t.String({ format: "email", maxLength: 256 }),
});