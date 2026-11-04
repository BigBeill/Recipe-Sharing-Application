import { t } from "elysia";
import { ValidatorCommonMongooseId } from "../../../../common/domain/validators/mongooseId.validator";

export const ValidatorCommonImageReference = t.Object({
   _id: ValidatorCommonMongooseId,
   key: t.String(),
   owner: ValidatorCommonMongooseId,
   status: t.Union([
      t.Literal('pending'),
      t.Literal('active'),
      t.Literal('deleting')
   ]),
});