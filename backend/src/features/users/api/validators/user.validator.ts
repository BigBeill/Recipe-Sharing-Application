import { t } from "elysia";
import { IdValidator } from "../../../../common/api/validators/id.validator";
import { ValidatorImageReference } from "../../../images/api/validators/imageReference.validator";

export const UserValidator = t.Object({
   _id: IdValidator,
   name: t.String({ minLength: 6, maxLength: 256 }),
   email: t.Optional(t.String()),
   bio: t.Optional(t.String()),
   imageReference: t.Optional(
      ValidatorImageReference
   ),
});