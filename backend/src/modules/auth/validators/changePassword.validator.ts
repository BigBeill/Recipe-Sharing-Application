import { t } from "elysia";

export const changePasswordValidator = t.Object({
   oldPassword: t.String(),
   newPassword: t.String(),
});