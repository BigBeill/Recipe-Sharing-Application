import { t } from "elysia";

export const ValidatorGet = t.Object({
   location: t.Union([
      t.Literal('users'),
      t.Literal('recipes'),
   ]),
   fileName: t.String(),
});