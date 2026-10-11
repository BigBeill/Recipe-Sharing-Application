import { t } from "elysia";
import { IdValidator } from "../../../../common/api/validators/id.validator";

export const ProcessFriendRequestValidator = t.Object({
   _id: IdValidator.properties._id,
   response: t.Boolean(),
});