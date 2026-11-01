import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const passwordResetTokenSchema = new Schema(
   {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      tokenHash: { type: String, required: true },
   },
   { timestamps: true },
);

passwordResetTokenSchema.index(
   { createdAt: 1 },
   { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

type PasswordResetTokenSchemaType = InferSchemaType<typeof passwordResetTokenSchema>;
export type PasswordResetTokenDocument = HydratedDocument<PasswordResetTokenSchemaType>;
export type PasswordResetTokenRecord = PasswordResetTokenSchemaType & { 
   _id: Types.ObjectId,
   createdAt: Date;
   updatedAt: Date;
};
export const PasswordResetTokenModel = model('PasswordReset', passwordResetTokenSchema);