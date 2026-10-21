import { t } from "elysia";
import { IdValidator } from "../../../../common/api/validators/id.validator";

export const ImageReferenceValidator = t.Object({
   _id: IdValidator.properties._id,
   key: t.String(),
   owner: IdValidator.properties._id,
   status: t.Union([
      t.Literal('pending'),
      t.Literal('active'),
      t.Literal('deleting')
   ]),
});