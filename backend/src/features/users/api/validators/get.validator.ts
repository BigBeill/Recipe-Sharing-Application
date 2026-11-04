import { t } from "elysia";

export const ValidatorIncomingUsersGetBody = t.Object({
   includeRelationship: t.Optional(t.Boolean({ default: false })),
});