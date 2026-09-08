import type { DeleteResult } from "mongoose";
import { RefreshTokenModel, type RefreshTokenRecord } from "../../common/mongo-db/schemas/refreshToken.schema";
import { UserModel, type UserRecord } from "../../common/mongo-db/schemas/user.schema";
import { PasswordResetTokenModel, type PasswordResetTokenRecord } from "../../common/mongo-db/schemas/passwordResetToken.schema";

type UserWithPassword = UserRecord & { passwordHash: string; };

type GetUserWithPasswordParams =
   | { _id: string, name?: string }
   | { _id?: string, name: string }

interface createRefreshTokenParams { 
   userId: string;
   hash: string;
   expiresAt: Date;
}

export class AuthRepository {

   async createPasswordResetToken(userId: string, tokenHash: string): Promise<void> {
      await PasswordResetTokenModel.create({ userId, tokenHash });
   }

   async createRefreshToken(params: createRefreshTokenParams): Promise<void> {
      const { userId, hash, expiresAt } = params;
      await RefreshTokenModel.create({ userId, hash, expiresAt });
   }

   async createUser (newUser: { name: string, email: string, passwordHash: string }): Promise<UserRecord> {
      const user = await UserModel.create(newUser);
      const { passwordHash, __v, ...record } = user.toObject();
      return record;
   }

   async deletePasswordResetTokens(userId: string): Promise<DeleteResult> {
      return await PasswordResetTokenModel.deleteMany({ userId });
   }

   async deleteRefreshTokenByHash(hash: string): Promise<DeleteResult> {
      return await RefreshTokenModel.deleteOne({ hash })
   }

   async deleteRefreshTokensByUserId(userId: string): Promise<DeleteResult> {
      return await RefreshTokenModel.deleteMany({ userId });
   }

   async getPasswordResetToken(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
      const passwordResetToken = await PasswordResetTokenModel.findOne({ tokenHash });
      return passwordResetToken;
   }

   async getUserById(_id: string): Promise<UserRecord | null> {
      const user = await UserModel.findById(_id);
      return user;
   }

   //! VALUES FROM THIS REPOSITORY CONTAINS CONFIDENTIAL INFORMATION THAT SHOULD NOT BE RETURNED TO THE FRONTEND (returned object contains passwordHash)
   async getUserWithPassword({ _id, name }: GetUserWithPasswordParams): Promise<UserWithPassword | null> {
      return UserModel.findOne({ ...(_id && { _id }), ...(name && { name }) }).select('+passwordHash').lean<UserWithPassword>();
   }

   async getRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | null> {
      return RefreshTokenModel.findOneAndDelete({ hash: tokenHash }).lean<RefreshTokenRecord>();
   }

   async searchUserExact({ name, email }: { name?: string, email?: string }): Promise<UserRecord[]> {
      const conditions: any[] = [];

      if (name) { conditions.push({ name }); }
      if (email) { conditions.push({ email }); }

      if (conditions.length === 0) { return []; }

      const userList = await UserModel.find({ $or: conditions }).select('+email').lean();
      return userList;
   }

   async updatePassword(userId: string, passwordHash: string): Promise<void> {
      await UserModel.findByIdAndUpdate(userId, { $set: { passwordHash } });
   }
}