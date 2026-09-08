import { t } from "elysia";

export const UploadImageValidator = t.Object({
   image: t.File({
      type: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: '5m',
   }),
});