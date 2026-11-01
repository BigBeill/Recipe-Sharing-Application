import { t } from "elysia";

export const DepartingFoodGroupValidator = t.Object({
   _id: t.Number(),
   description: t.String(),
});