import { ConflictError, NotFoundError, UnauthorizedError } from "../../common/types/error.types";
import { hashPassword, verifyPassword } from "../../common/utils/password";
import { AuthRepository } from "./auth.repository";
import type { AuthResultType, SavedTokenType } from "./auth.types";
import { sendPasswordResetEmail } from '../../services/email/email.service';
import type AuthIdParams from '../../common/parameters/authId.parameters';
import { buildConflictString } from '../users/users.utils';
import { randomBytes } from 'node:crypto';
import type { DeleteResult } from 'mongoose';
import removeMongooseNoise from '../../common/utils/removeMongooseNoise';
import { generateRefreshToken, signAccessToken } from './tokenSigner';
import { graceCache } from "./lib/refreshTokenGraceCache";

type TypeBuildAuthResultOptions = { oldRefreshToken: string; expiresAt?: undefined; } | { oldRefreshToken?: undefined; expiresAt: Date };

export class AuthService {
   private readonly repository: AuthRepository;

   constructor({ authRepository }: { authRepository: AuthRepository }) {
      this.repository = authRepository;
   }

   async changePassword(oldPassword: string, newPassword: string, { authId }: AuthIdParams): Promise<void> {
      if(!authId) { throw new UnauthorizedError(); }

      const userAndPassword = await this.repository.getUserWithPassword({_id: authId});
      if (!userAndPassword) { throw new UnauthorizedError(); }

      const validPassword = await verifyPassword(oldPassword, userAndPassword.passwordHash);
      if (!validPassword) { throw new UnauthorizedError(); }

      const passwordHash = await hashPassword(newPassword);

      await this.repository.updatePassword(authId, passwordHash);
   }

   async login(loginCredentials: { name: string, password: string, rememberMe?: boolean }): Promise<AuthResultType> {
      const { name, password, rememberMe } = loginCredentials;
      const userAndPassword = await this.repository.getUserWithPassword({ name });
      if (!userAndPassword) { throw new UnauthorizedError('Invalid Username'); }

      const validPassword = await verifyPassword(password, userAndPassword.passwordHash);
      if (!validPassword) { throw new UnauthorizedError('Invalid Password'); }

      // remove the passwordHash before returning to client
      const { passwordHash, ...user } = userAndPassword;

      const oneDay = 60 * 60 * 24 * 1000 // 1 day in milliseconds

      const expiresAt = new Date(Date.now() + (rememberMe ? oneDay : oneDay * 30 ));
      return this.buildAuthResult(user._id.toString(), { expiresAt });
   }

   async register(newUser: { name: string, email: string, password: string }): Promise<AuthResultType> {
      const { name, email, password } = newUser;

      const conflictingUserList = await this.repository.searchUserExact({ name, email });

      if (conflictingUserList.length > 0) { 
         const conflictingUser = { _id: "0", name, email }
         throw new ConflictError(buildConflictString(conflictingUser, conflictingUserList)!);
      }
      
      const passwordHash = await hashPassword(password);
      const user = await this.repository.createUser({ name, email, passwordHash });

      const refreshExpiresAt = new Date(Date.now() + (60 * 60 * 24 * 1000)) // 1 day in milliseconds

      return this.buildAuthResult(user._id.toString(), { expiresAt: refreshExpiresAt });
   }

   async removeRefreshToken(token: string): Promise<DeleteResult> {
      const tokenHash = new Bun.CryptoHasher("sha256").update(token).digest("hex");
      return await this.repository.deleteRefreshTokenByHash(tokenHash);
   }

   async refresh(refreshToken: string): Promise<AuthResultType> {

      const hashedToken = new Bun.CryptoHasher("sha256").update(refreshToken).digest("hex");

      const databaseRefreshToken: SavedTokenType | null = removeMongooseNoise(await this.repository.getRefreshToken(hashedToken));
      if (databaseRefreshToken) {
         const authResponse = await this.buildAuthResult(databaseRefreshToken.userId.toString(), { expiresAt: databaseRefreshToken.expiresAt });
         graceCache.set(hashedToken, authResponse.tokens.refreshToken, databaseRefreshToken.userId.toString(), 5_000);
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
      const user = await this.repository.searchUserExact({ email: normalizedEmail });
      if (!user[0]) { throw new NotFoundError(`user containing { email: ${email} }`); }
      const userId = user[0]._id.toString();

      await this.cleanSavedTokens(userId);

      const resetToken = randomBytes(32).toString('hex');
      const tokenHash = new Bun.CryptoHasher("sha256").update(resetToken).digest("hex");
      await this.repository.createPasswordResetToken(userId, tokenHash);

      await sendPasswordResetEmail(email, resetToken);
   }

   async verifyPassword(_id: string, password: string): Promise<boolean> {
      const userWithPassword = await this.repository.getUserWithPassword({ _id });
      if (!userWithPassword) { throw new UnauthorizedError('Invalid _id provided'); }
      const validPassword = await verifyPassword(password, userWithPassword.passwordHash);
      if (!validPassword) { throw new UnauthorizedError('Invalid Password'); }
      return true;
   }

   async resetPassword(password: string, resetToken: string): Promise<void> {
   
      const tokenHash = new Bun.CryptoHasher("sha256").update(resetToken).digest("hex");
      const tokenHashRecord = await this.repository.getPasswordResetToken(tokenHash);

      if (!tokenHashRecord) { throw new NotFoundError(""); }
      const userId = tokenHashRecord.tokenHash

      const [ hashedPassword ] = await Promise.all([
         hashPassword(password),
         this.repository.deletePasswordResetTokens(userId),
         this.repository.deleteRefreshTokensByUserId(userId),
      ]);

      await this.repository.updatePassword(userId, hashedPassword);
   }

   private async buildAuthResult(userId: string, options: TypeBuildAuthResultOptions): Promise<AuthResultType> {

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
   private async cleanSavedTokens(userId: string): Promise<void> {
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