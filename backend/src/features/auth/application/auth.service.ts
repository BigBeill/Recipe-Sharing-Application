import { hashPassword, verifyPassword } from "../../../common/utils/password";
import { AuthRepository } from "../infrastructure/auth.repository";
import { sendPasswordResetEmail } from '../../../externalResources/email/email.service';
import { randomBytes } from 'node:crypto';
import type { DeleteResult, Types } from 'mongoose';
import { generateRefreshToken, signAccessToken } from '../tokenSigner';
import { graceCache } from "../lib/refreshTokenGraceCache";
import type { PasswordResetTokenRecord } from "../../../externalResources/database/mongoose/schemas/passwordResetToken.schema";
import type { AuthIdParam } from "../../../common/api/authIdParam";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../../global/departingData/error.types";
import type { TypeAuthResult, TypeSavedRefreshToken } from "../auth.types";

type TypeBuildAuthResultOptions = { oldRefreshToken: string; expiresAt?: undefined; } | { oldRefreshToken?: undefined; expiresAt: Date };

interface LoginParams {
   name: string, 
   password: string, 
   rememberMe?: boolean,
}

interface RegisterParams {
   name: string, 
   email: string, 
   password: string,
}

export class AuthService {
   private readonly repository: AuthRepository;

   constructor({ authRepository }: { authRepository: AuthRepository }) {
      this.repository = authRepository;
   }



   async changePassword(oldPassword: string, newPassword: string, { authId }: AuthIdParam): Promise<void> {
      if(!authId) { throw new UnauthorizedError(); }

      const userAndPassword = await this.repository.getUserWithPasswordIncluded(authId);

      const validPassword = await verifyPassword(oldPassword, userAndPassword.passwordHash);
      if (!validPassword) { throw new UnauthorizedError(); }

      const passwordHash = await hashPassword(newPassword);

      await this.repository.updatePassword(authId, passwordHash);
   }



   async deleteRefreshToken(token: string): Promise<DeleteResult> {
      const tokenHash = new Bun.CryptoHasher("sha256").update(token).digest("hex");
      return await this.repository.deleteRefreshTokenByHash(tokenHash);
   }



   async login(params: LoginParams): Promise<TypeAuthResult> {
      const { name, password, rememberMe } = params;

      const userAndPassword = await this.repository.findUserWithPasswordIncluded(name);
      if (!userAndPassword) { throw new UnauthorizedError('Invalid Username'); }

      const validPassword = await verifyPassword(password, userAndPassword.passwordHash);
      if (!validPassword) { throw new UnauthorizedError('Invalid Password'); }

      // remove the passwordHash before returning to client
      const { passwordHash, ...user } = userAndPassword;

      const oneDay = 60 * 60 * 24 * 1000 // 1 day in milliseconds

      const expiresAt = new Date(Date.now() + (rememberMe ? oneDay : oneDay * 30 ));
      return this.buildAuthResult(user._id, { expiresAt });
   }



   async register(params: RegisterParams): Promise<TypeAuthResult> {
      const { name, email, password } = params;

      const conflictingUserList = await this.repository.searchUserExact({ name, email });
      if (conflictingUserList.length > 0) { 
         throw new ConflictError("Some user information has already been taken");
      }
      
      const passwordHash = await hashPassword(password);
      const user = await this.repository.createUser({ name, email, passwordHash });

      const refreshExpiresAt = new Date(Date.now() + (60 * 60 * 24 * 1000)) // 1 day in milliseconds

      return this.buildAuthResult(user._id, { expiresAt: refreshExpiresAt });
   }



   async refresh(refreshToken: string): Promise<TypeAuthResult> {

      const hashedToken = new Bun.CryptoHasher("sha256").update(refreshToken).digest("hex");
      const databaseRefreshToken: TypeSavedRefreshToken | null = await this.repository.consumeRefreshToken(hashedToken);

      if(databaseRefreshToken !== null) {
         const authResponse = await this.buildAuthResult(databaseRefreshToken.userId, { expiresAt: databaseRefreshToken.expiresAt });
         graceCache.set(hashedToken, authResponse.tokens.refreshToken, databaseRefreshToken.userId, 5_000);
         return authResponse;
      }
      else {
         const withinGrace = graceCache.get(hashedToken);
         if (withinGrace) { return this.buildAuthResult(withinGrace.userId, { oldRefreshToken: withinGrace.token }); }
         else { throw new UnauthorizedError('invalid refresh token'); }
      }
   }



   async requestPasswordReset(email: string): Promise<void> {
      const normalizedEmail = email.toLowerCase().trim();

      const userList = await this.repository.searchUserExact({ email: normalizedEmail });
      const user = userList[0];
      if (!user) { throw new NotFoundError(`Database could not find a user with the email: ${email}`); }

      await this.cleanSavedTokens(user._id);

      const resetToken = randomBytes(32).toString('hex');
      const tokenHash = new Bun.CryptoHasher("sha256").update(resetToken).digest("hex");
      await this.repository.createPasswordResetToken(user._id, tokenHash);

      await sendPasswordResetEmail(email, { name: user.name, resetToken});
   }



   async verifyPassword(_id: Types.ObjectId, password: string): Promise<boolean> {
      const userWithPassword = await this.repository.getUserWithPasswordIncluded(_id);
      if (!userWithPassword) { throw new UnauthorizedError('Invalid _id provided'); }

      const validPassword = await verifyPassword(password, userWithPassword.passwordHash);
      if (!validPassword) { throw new UnauthorizedError('Invalid Password'); }

      return true;
   }



   async resetPassword(password: string, resetToken: string): Promise<void> {
   
      const tokenHash = new Bun.CryptoHasher("sha256").update(resetToken).digest("hex");

      // fetch the reset token by hash
      let tokenHashRecord: PasswordResetTokenRecord | null;
      try { tokenHashRecord = await this.repository.consumePasswordResetToken(tokenHash); }
      catch (error) { 
         console.log("auth.service.resetPassword failed to fetch token form the database:", error); 
         throw new NotFoundError(""); 
      }

      if (!tokenHashRecord) { throw new NotFoundError(""); }
      
      // hash the new password and grab the userId its for
      const hashedPassword = await hashPassword(password);

      // hahs the new password and remove any old instances of password reset requests
      const userId = tokenHashRecord.userId;
      const [] = await Promise.all([
         this.repository.updatePassword(userId, hashedPassword),
         this.repository.deletePasswordResetTokens(userId),
         this.repository.deleteRefreshTokensByUserId(userId),
      ]);

      return;
   }



   private async buildAuthResult(userId: Types.ObjectId, options: TypeBuildAuthResultOptions): Promise<TypeAuthResult> {

      const accessToken = await signAccessToken(userId);

      let refreshToken: string;
      // check if a new refresh token has been provided, create one if it has not
      if (options.oldRefreshToken) { refreshToken = options.oldRefreshToken }
      else {
         // generate a new refresh token
         refreshToken = generateRefreshToken();
         const hash = new Bun.CryptoHasher("sha256").update(refreshToken).digest("hex");
         await this.repository.createRefreshToken({ userId, hash, expiresAt: options.expiresAt ?? new Date(Date.now()) }); //Logically expiresAt should never be new Date(Date.now()), but if somehow the function gets sent no expiration time and no token then just get the token to kill itself now.
      }

      return { userId, tokens: { accessToken, refreshToken } }
   }



   // function that removes all tokens from a database for a specific user. refresh tokens, reset tokens, other I add down the road. Make user sign in and request everything from scratch.
   private async cleanSavedTokens(userId: Types.ObjectId): Promise<void> {
      const results = await Promise.allSettled([
         this.repository.deletePasswordResetTokens(userId),
         this.repository.deleteRefreshTokensByUserId(userId),
      ]);

      const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
      
      if (failures.length > 0) {
         for (const failure of failures) {
            console.error(`token cleanup failed for userId ${userId}:`, failure.reason);
         }
         throw new Error(`token cleanup failed for userId ${userId}`);
      }
   }


   
}