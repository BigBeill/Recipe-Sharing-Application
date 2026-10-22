import { t } from "elysia";

export const UploadValidator = t.Object({
   location: t.Union([
      t.Literal('users'),
      t.Literal('recipes'),
   ]),
   file: t.File({
      type: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: '5m',
   }),

});