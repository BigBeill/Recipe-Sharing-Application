import { t } from "elysia";
import { IdValidator } from "../../../../common/api/validators/id.validator";

export const ValidatorImageReference = t.Object({
   _id: IdValidator,
   key: t.String(),
   owner: IdValidator,
   status: t.Union([
      t.Literal('pending'),
      t.Literal('active'),
      t.Literal('deleting')
   ]),
});