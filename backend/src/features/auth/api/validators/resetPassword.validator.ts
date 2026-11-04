import { t } from "elysia";

export const ValidatorIncomingAuthResetPasswordBody = t.Object({
   password: t.String(),
   token: t.String(),
});