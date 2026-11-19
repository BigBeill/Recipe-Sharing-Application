import { t } from "elysia";

export const ValidatorIncomingAuthChangePasswordBody = t.Object({
   oldPassword: t.String(),
   newPassword: t.String(),
});