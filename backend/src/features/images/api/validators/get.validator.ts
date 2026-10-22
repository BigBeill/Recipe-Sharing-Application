import { t } from "elysia";

export const GetValidator = t.Object({
   location: t.Union([
      t.Literal('users'),
      t.Literal('recipes'),
   ]),
   fileName: t.String(),
});