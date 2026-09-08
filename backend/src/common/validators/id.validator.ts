import { t } from "elysia";

export const IdValidator = t.Object({
   _id: t.String({ minLength: 24, maxLength: 24 })
});