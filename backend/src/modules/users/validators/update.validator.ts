import { t } from "elysia";
import { ImageLinkValidator } from "../../images/validators/imageLink.validator";

export const UpdateValidator = t.Object({
   name: t.Optional(t.String()),
   email: t.Optional(t.String()),
   bio: t.Optional(t.String()),
   image: t.Optional(ImageLinkValidator.properties.image),
});