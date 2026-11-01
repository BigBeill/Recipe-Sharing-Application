import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const refreshTokenSchema = new Schema(
   {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      hash: { type: String, required: true, unique: true },
      expiresAt: { type: Date, required: true },
   },
   { timestamps: true },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1 });

type RefreshTokenSchemaType = InferSchemaType<typeof refreshTokenSchema>;
export type RefreshTokenDocument = HydratedDocument<RefreshTokenSchemaType>;
export type RefreshTokenRecord = RefreshTokenSchemaType & { 
   _id: Types.ObjectId,
   createdAt: Date;
   updatedAt: Date;
};
export const RefreshTokenModel = model('RefreshToken', refreshTokenSchema);