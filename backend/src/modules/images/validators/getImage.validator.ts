import { t } from "elysia";

export const GetImageValidator = t.Object({
   context: t.Union([
      t.Literal('avatars'),
      t.Literal('recipes'),
   ]),
   fileName: t.String(),
});