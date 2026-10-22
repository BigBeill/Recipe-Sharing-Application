import { t } from "elysia";

export const DepartingIngredientConversionValidator = t.Object({
   food_id: t.Number(),
   measure_id: t.Number(),
   measure_description: t.String(),
   value: t.Number(),
})