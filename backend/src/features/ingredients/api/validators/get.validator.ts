import { t } from "elysia";

export const ValidatorIncomingIngredientsGetBody = t.Object({
   includeNutrition: t.Optional(t.Boolean()),
});