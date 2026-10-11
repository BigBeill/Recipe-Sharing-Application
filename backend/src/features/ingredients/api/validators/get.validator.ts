import { t } from "elysia";

export const GetValidator = t.Object({
   includeNutrition: t.Optional(t.Boolean()),
});