import type { DeleteResult, Types } from "mongoose";
import { RefreshTokenModel, type RefreshTokenRecord } from "../../../externalResources/database/mongoose/schemas/refreshToken.schema";
import { PasswordResetTokenModel, type PasswordResetTokenRecord } from "../../../externalResources/database/mongoose/schemas/passwordResetToken.schema";
import { NotFoundError } from "../../../global/departingData/errorClasses";
import { UserModel, type UserRecord } from "../../../externalResources/database/mongoose/schemas/user.schema";

type UserWithPassword = UserRecord & { passwordHash: string; };

interface createRefreshTokenParams { 
   userId: Types.ObjectId;
   hash: string;
   expiresAt: Date;
}

export class AuthenticationRepository {



   async consumePasswordResetToken(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
      const passwordResetToken = await PasswordResetTokenModel.findOneAndDelete({ tokenHash }).lean<PasswordResetTokenRecord>();
      return passwordResetToken;
   }



   async consumeRefreshToken(tokenHash: string): Promise<RefreshTokenRecord> {
      const refreshToken = await RefreshTokenModel.findOneAndDelete({ hash: tokenHash }).lean<RefreshTokenRecord>();
      if (!refreshToken) { throw new NotFoundError('RefreshToken'); }
      return refreshToken;
   }



   async createPasswordResetToken(userId: Types.ObjectId, tokenHash: string): Promise<PasswordResetTokenRecord> {
      return await PasswordResetTokenModel.create({ userId, tokenHash });
   }



   async createRefreshToken(params: createRefreshTokenParams): Promise<RefreshTokenRecord> {
      const { userId, hash, expiresAt } = params;
      return await RefreshTokenModel.create({ userId, hash, expiresAt });
   }



   async deletePasswordResetTokens(userId: Types.ObjectId): Promise<DeleteResult> {
      return await PasswordResetTokenModel.deleteMany({ userId });
   }



   async deleteRefreshTokenByHash(hash: string): Promise<void> {
      await RefreshTokenModel.deleteOne({ hash })
   }



   async deleteRefreshTokensByUserId(userId: Types.ObjectId): Promise<DeleteResult> {
      return await RefreshTokenModel.deleteMany({ userId });
   }



   //! FUNCTION RETURNS CONFIDENTIAL INFORMATION THAT SHOULD NOT BE RETURNED TO THE FRONTEND (returned object contains passwordHash)
   async findUserWithPasswordIncluded(name: string): Promise<UserWithPassword> {
      const userRecord = await UserModel.findOne({ name }).select('+passwordHash').lean<UserWithPassword>();
      if (!userRecord) { throw new NotFoundError('user'); }
      return userRecord;
   }



   //! VALUES FROM THIS REPOSITORY CONTAINS CONFIDENTIAL INFORMATION THAT SHOULD NOT BE RETURNED TO THE FRONTEND (returned object contains passwordHash)
   async getUserWithPasswordIncluded(_id: Types.ObjectId): Promise<UserWithPassword> {
      const userRecord = await UserModel.findOne({ _id }).select('+passwordHash').lean<UserWithPassword>();
      if (!userRecord) { throw new NotFoundError('user'); }
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
}