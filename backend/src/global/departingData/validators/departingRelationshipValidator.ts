import { t } from "elysia";
import { IdValidator } from "../../../common/api/validators/id.validator";

export const DepartingRelationshipValidator = t.Object({
   _id: IdValidator,
   ownerId: IdValidator,
   targetId: IdValidator,
   type: t.Union([
      t.Literal('friend'),
      t.Literal('requestReceived'),
      t.Literal('requestSent')
   ]),
})