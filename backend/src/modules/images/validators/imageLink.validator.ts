import { t } from "elysia";

export const ImageLinkValidator = t.Object({
   image: t.Object({
      filename: t.String(),
      url: t.String(),
      size: t.Number(),
      mimetype: t.String(),
   })
});