import { t } from "elysia";

export const PostgresIdValidator = t.Number();

export const PostgresIdParamsValidator = t.Object({ _id: PostgresIdValidator });