import { Schema, type InferSchemaType } from 'mongoose';

export const ImageSchema = new Schema (
   {
      filename: { type: String, required: true },
      url: { type: String, required: true },
      size: { type: Number, required: true },
      mimetype: { type: String, required: true },
   },
   {
      _id: false,
      timestamps: false
   }
);

export type ImageSubRecord = InferSchemaType<typeof ImageSchema>;