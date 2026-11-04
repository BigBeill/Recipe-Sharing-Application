import { t } from "elysia";
import { ValidatorCommonMongooseId } from "../../../../common/domain/validators/mongooseId.validator";

export const ValidatorIncomingUsersProcessFriendRequestBody = t.Object({
   _id: ValidatorCommonMongooseId,
   response: t.Boolean(),
});