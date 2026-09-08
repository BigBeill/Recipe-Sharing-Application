import { t } from "elysia"

export const NutritionValidator = t.Object({
   nutrition: t.Object({
      calories: t.Number(),
      fat: t.Number(),
      cholesterol: t.Number(),
      sodium: t.Number(),
      potassium: t.Number(),
      carbohydrates: t.Number(),
      fibre: t.Number(),
      sugar: t.Number(),
      protein: t.Number(),
   }),
})