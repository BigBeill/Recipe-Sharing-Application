import { Schema, Types, model, type HydratedDocument } from 'mongoose';
import { ImageSchema } from './image.schema';
import type { ImageType } from '../../../modules/images/images.types';

interface TypeTimestamps {
   createdAt: Date;
   updatedAt: Date;
}

interface TypeDatabaseUser {
   name: string;
   email?: string;
   bio?: string;
   image?: ImageType;
}

interface TypeUserSecrets {
   email: string;
   passwordHash: string;
}

type UserModelType = TypeDatabaseUser & Partial<TypeUserSecrets> & TypeTimestamps;

const userSchema = new Schema<UserModelType>(
   {
      name: { type: String, required: true, unique:true },
      email: { type: String, required: true, unique:true, select: false },
      bio: String,
      image: { type: ImageSchema, default: undefined, set: (v: unknown) => (v === null ? undefined : v) },
      passwordHash: {type: String, required: true, select: false},
   }, { timestamps: true }
);

export type UserDocument = HydratedDocument<UserModelType>;
export type UserRecord = TypeDatabaseUser & TypeTimestamps & { _id: Types.ObjectId };
export type UserRecordSecrets = UserRecord & TypeUserSecrets;

export const UserModel = model<UserModelType>('User', userSchema);