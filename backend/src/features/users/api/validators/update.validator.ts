import { t } from "elysia";
import { ImageReferenceValidator } from "../../../images/api/validators/imageReference.validator";

export const UpdateValidator = t.Object({
   name: t.Optional(t.String()),
   email: t.Optional(t.String()),
   bio: t.Optional(t.String()),
   image: t.Optional(ImageReferenceValidator),
});