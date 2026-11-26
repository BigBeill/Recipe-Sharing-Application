import { t } from "elysia";
import { ValidatorCommonImageReference } from "../../../images/domain/validators/imageReference.validator";
import { ValidatorCommonSignedImageUrl } from "../../../images/domain/validators/signedImageUrl.validator";
import { ValidatorCommonMongooseId } from "../../../../common/domain/validators/mongooseId.validator";
import { ValidatorCommonRelationship } from "../../../relationships/domain/validators/relationship.validator";

export const ValidatorCommonUser = t.Object({
   _id: ValidatorCommonMongooseId,
   name: t.String({ minLength: 6, maxLength: 256 }),
   bio: t.Optional(t.String()),
   signedImageUrl: t.Optional(ValidatorCommonSignedImageUrl),
   relationship: t.Optional(t.Nullable(ValidatorCommonRelationship)),
});

export const ValidatorCommonUserDraft = t.Object({
   ...t.Omit(ValidatorCommonUser, ['_id', 'signedImageUrl']).properties,
   imageReference: t.Optional(ValidatorCommonImageReference),
});