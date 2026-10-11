import { t } from "elysia";

export const PostgresIdValidator = t.Object({
   _id: t.Number(),
});