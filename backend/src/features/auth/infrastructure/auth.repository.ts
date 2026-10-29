import type { DeleteResult, Types } from "mongoose";
import { RefreshTokenModel, type RefreshTokenRecord } from "../../../externalResources/database/mongoose/schemas/refreshToken.schema";
import { UserModel, type UserRecord } from "../../../externalResources/database/mongoose/schemas/user.schema";
import { PasswordResetTokenModel, type PasswordResetTokenRecord } from "../../../externalResources/database/mongoose/schemas/passwordResetToken.schema";
import type { TypeUserDraft } from "../auth.types";
import { NotFoundError } from "../../../global/departingData/errorClasses";

type UserWithPassword = UserRecord & { passwordHash: string; };

interface createRefreshTokenParams { 
   userId: Types.ObjectId;
   hash: string;
   expiresAt: Date;
}

export class AuthRepository {



   async consumePasswordResetToken(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
      return await PasswordResetTokenModel.findOneAndDelete({ tokenHash }).lean<PasswordResetTokenRecord>();
   }



   async consumeRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | null> {
      return await RefreshTokenModel.findOneAndDelete({ hash: tokenHash }).lean<RefreshTokenRecord>();
   }



   async createPasswordResetToken(userId: Types.ObjectId, tokenHash: string): Promise<PasswordResetTokenRecord> {
      return await PasswordResetTokenModel.create({ userId, tokenHash });
   }



   async createRefreshToken(params: createRefreshTokenParams): Promise<RefreshTokenRecord> {
      const { userId, hash, expiresAt } = params;
      return await RefreshTokenModel.create({ userId, hash, expiresAt });
   }



   async createUser ({ name, email, passwordHash }: TypeUserDraft): Promise<UserRecord> {
      const user = await UserModel.create({ name, email, passwordHash });
      const { passwordHash: _, email: __, __v, ...record } = user.toObject();
      return record;
   }



   async deletePasswordResetTokens(userId: Types.ObjectId): Promise<DeleteResult> {
      return await PasswordResetTokenModel.deleteMany({ userId });
   }



   async deleteRefreshTokenByHash(hash: string): Promise<DeleteResult> {
      return await RefreshTokenModel.deleteOne({ hash })
   }



   async deleteRefreshTokensByUserId(userId: Types.ObjectId): Promise<DeleteResult> {
      return await RefreshTokenModel.deleteMany({ userId });
   }



   //! FUNCTION RETURNS CONFIDENTIAL INFORMATION THAT SHOULD NOT BE RETURNED TO THE FRONTEND (returned object contains passwordHash)
   async findUserWithPasswordIncluded(name: string): Promise<UserWithPassword | null> {
      return await UserModel.findOne({ name }).select('+passwordHash').lean<UserWithPassword>();
   }



   async getUser(_id: Types.ObjectId): Promise<UserRecord> {
      const userRecord = await UserModel.findById(_id).lean();
      if (!userRecord) { throw new NotFoundError(`Database could not find user: ${_id}`) }
      else { return userRecord; }
   }



   //! VALUES FROM THIS REPOSITORY CONTAINS CONFIDENTIAL INFORMATION THAT SHOULD NOT BE RETURNED TO THE FRONTEND (returned object contains passwordHash)
   async getUserWithPasswordIncluded(_id: Types.ObjectId): Promise<UserWithPassword> {
      const userRecord = await UserModel.findOne({ _id }).select('+passwordHash').lean<UserWithPassword>();
      if (!userRecord) { throw new NotFoundError(`Database could not find user: ${_id}`); }
      else { return userRecord; }
   }



   //! FUNCTION RETURNS CONFIDENTIAL INFORMATION THAT SHOULD NOT BE RETURNED TO THE FRONTEND (returned object contains email)
   async searchUserExact({ name, email }: { name?: string, email?: string }): Promise<UserRecord[]> {
      const conditions: any[] = [];

      if (name) { conditions.push({ name }); }
      if (email) { conditions.push({ email }); }

      if (conditions.length === 0) { return []; }

      const userList = await UserModel.find({ $or: conditions }).select('+email').lean();
      return userList;
   }

   

   async updatePassword(_id: Types.ObjectId, passwordHash: string): Promise<void> {
      const result = await UserModel.updateOne({ _id }, { $set: { passwordHash } });
      if (result.matchedCount === 0) { throw new NotFoundError(`Database could not find user: ${_id}`); }
   }
}