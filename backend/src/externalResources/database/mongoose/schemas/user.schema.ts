import { Schema, Types, model, type HydratedDocument } from 'mongoose';

interface TypeTimestamps {
   createdAt: Date;
   updatedAt: Date;
}

interface TypeDatabaseUser {
   name: string;
   email?: string;
   bio?: string;
   imageReferenceId?: Types.ObjectId;
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
      imageReferenceId: { type: Schema.Types.ObjectId },
      passwordHash: {type: String, required: true, select: false},
   }, { timestamps: true }
);

export type UserDocument = HydratedDocument<UserModelType>;
export type UserRecord = TypeDatabaseUser & TypeTimestamps & { _id: Types.ObjectId };
export type UserRecordSecrets = UserRecord & TypeUserSecrets;

export const UserModel = model<UserModelType>('User', userSchema);