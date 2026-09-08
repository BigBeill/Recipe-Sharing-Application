import { t } from "elysia";

export const PaginationValidator = t.Object({
   skip: t.Optional(t.Numeric({minimum: 0, maximum: 1024, default: 0})),
   limit: t.Optional(t.Numeric({minimum: 0, maximum: 64, default: 16})),
});