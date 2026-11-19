import { t } from "elysia";
import { ValidatorCommonMongooseId } from "../../../../common/domain/validators/mongooseId.validator";

export const ValidatorCommonRelationship = t.Object({
   _id: ValidatorCommonMongooseId,
   ownerId: ValidatorCommonMongooseId,
   targetId: ValidatorCommonMongooseId,
   type: t.Union([
      t.Literal('friend'),
      t.Literal('requestReceived'),
      t.Literal('requestSent')
   ]),
})