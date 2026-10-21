import { model, Schema, Types, type InferSchemaType } from 'mongoose';

export const imageReferenceSchema = new Schema (
   {
      key: { type: String, required: true, unique: true },
      owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
      status: {
         type: String,
         enum: ["pending", "active", "deleting"],
         default: "pending",
         required: true,
      }
   },
   { timestamps: true }
);

imageReferenceSchema.index({ status: 1, createdAt: 1 });

export type ImageReferenceRecord = InferSchemaType<typeof imageReferenceSchema> & { _id: Types.ObjectId };
export const ImageReferenceModel = model("Image", imageReferenceSchema);