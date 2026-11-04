import { t } from "elysia";
import { ValidatorCommonMongooseId } from "../../../../common/domain/validators/mongooseId.validator";
import { ValidatorIncomingPaginatedList } from "../../../../common/domain/validators/pagination.validator";

export const ValidatorIncomingUsersSearchBody = t.Object({
   _id: t.Optional(ValidatorCommonMongooseId),
   name: t.Optional(t.String()),
   ...ValidatorIncomingPaginatedList.properties,
   includeRelationship: t.Optional(t.Boolean()),
});