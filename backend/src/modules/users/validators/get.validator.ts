import { t } from "elysia";

export const GetValidator = t.Object({
   includeRelationship: t.Optional(t.Boolean({ default: false })),
});