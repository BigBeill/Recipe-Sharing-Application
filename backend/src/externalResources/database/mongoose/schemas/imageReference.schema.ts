import { model, Schema, Types, type HydratedDocument, type InferSchemaType, type SchemaDefinitionProperty } from 'mongoose';
import type { TypeImageReferenceDraft } from '../../../../features/images/domain/images.types';



export type RecordImageReferenceDraft = TypeImageReferenceDraft;



const imageReferenceDefinition = {
   key: { type: String, required: true, unique: true },
   owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
   status: {
      type: String,
      enum: ["pending", "active", "deleting"],
      default: "pending",
      required: true,
   }
} as const satisfies Record<keyof RecordImageReferenceDraft, SchemaDefinitionProperty>

const imageReferenceSchema = new Schema (imageReferenceDefinition, { timestamps: true });
imageReferenceSchema.index({ status: 1, createdAt: 1 });

export type RecordImageReference = InferSchemaType<typeof imageReferenceSchema> & { _id: Types.ObjectId };
export type DocumentImageReference = HydratedDocument<RecordImageReference>;

export const ModelImageReference = model("ImageReference", imageReferenceSchema);