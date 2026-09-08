import { t } from "elysia";

export const resetPasswordValidator = t.Object({
   password: t.String(),
   token: t.String(),
});