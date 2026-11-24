import { verifyPassword } from "../../../common/utils/password";
import { sendPasswordResetEmail } from '../../../externalResources/email/email.service';
import { randomBytes } from 'node:crypto';
import type { Types } from 'mongoose';
import { generateRefreshToken, signAccessToken } from '../tokenSigner';
import type { TypeAuthResult, TypeSavedRefreshToken } from "../domain/auth.types";
import type { AuthenticationRepository } from "../infrastructure/authentication.repository";
import { graceCache } from "../lib/refreshTokenGraceCache";
import { AppErrorNotFound, AppErrorUnauthorized } from "../../../global/departingData/errorClasses";

type TypeBuildAuthResultOptions = { cachedRefreshToken: string; expiresAt?: undefined; } | { cachedRefreshToken?: undefined; expiresAt: Date };

interface LoginParams {
   name: string, 
   password: string, 
   rememberMe?: boolean,
}

export class AuthenticationService {
   private readonly repository: AuthenticationRepository;

   constructor({ authenticationRepository }: { 
      authenticationRepository: AuthenticationRepository,
   }) {
      this.repository = authenticationRepository;
   }



   async deleteRefreshToken(token: string): Promise<void> {
      const tokenHash = new Bun.CryptoHasher("sha256").update(token).digest("hex");
      await this.repository.deleteRefreshTokenByHash(tokenHash);
   }



   async login(params: LoginParams): Promise<TypeAuthResult> {
      const { name, password, rememberMe } = params;

      const userAndPassword = await this.repository.findUserWithPasswordIncluded(name);

      const validPassword = await verifyPassword(password, userAndPassword.passwordHash);
      if (!validPassword) { throw new AppErrorUnauthorized(); }

      // remove the passwordHash before returning to client
      const { passwordHash, ...user } = userAndPassword;

      const oneDay = 60 * 60 * 24 * 1000 // 1 day in milliseconds

      const expiresAt = new Date(Date.now() + (rememberMe ? oneDay * 30 : oneDay ));
      return this.buildAuthResult(user._id, { expiresAt });
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
         if (withinGrace) { return this.buildAuthResult(withinGrace.userId, { cachedRefreshToken: withinGrace.token }); }
         else { throw new AppErrorUnauthorized(); }
      }
   }



   async requestPasswordReset(email: string): Promise<void> {
      const normalizedEmail = email.toLowerCase().trim();

      const userList = await this.repository.searchUserExact({ email: normalizedEmail });
      const user = userList[0];
      if (!user) { throw new AppErrorNotFound('email'); }

      await this.cleanSavedTokens(user._id);

      const resetToken = randomBytes(32).toString('hex');
      const tokenHash = new Bun.CryptoHasher("sha256").update(resetToken).digest("hex");
      await this.repository.createPasswordResetToken(user._id, tokenHash);

      await sendPasswordResetEmail(email, { name: user.name, resetToken});
   }



   async verifyPassword(userId: Types.ObjectId, password: string): Promise<void> {
      const user = await this.repository.getUserWithPasswordIncluded(userId);
      const passwordConfirmation = await verifyPassword(password, user.passwordHash);
      if (passwordConfirmation !== true) { throw new AppErrorUnauthorized(); }
   }



   async buildAuthResult(userId: Types.ObjectId, options: TypeBuildAuthResultOptions): Promise<TypeAuthResult> {

      // * create access token
      const accessToken = await signAccessToken(userId);

      // * if a refreshToken from cache was provided, then just return it as is
      if (options.cachedRefreshToken) {
         return { userId, tokens: { accessToken, refreshToken: options.cachedRefreshToken } }
      }
      // * otherwise generate a new refresh token
      else {
         const refreshToken = generateRefreshToken();
         const refreshTokenHash = new Bun.CryptoHasher("sha256").update(refreshToken).digest("hex");
         await this.repository.createRefreshToken({ userId, hash: refreshTokenHash, expiresAt: options.expiresAt ?? new Date(Date.now()) });
         
         return { userId, tokens: { accessToken, refreshToken } }
      }
   }



   // function that removes all tokens from a database for a specific user. refresh tokens, reset tokens, other I add down the road. Make user sign in and request everything from scratch.
   async cleanSavedTokens(userId: Types.ObjectId): Promise<void> {
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



   async consumePasswordResetToken(resetToken: string): Promise<Types.ObjectId | null> {
      const tokenHash = new Bun.CryptoHasher("sha256").update(resetToken).digest("hex");
      const tokenRecord = await this.repository.consumePasswordResetToken(tokenHash);
      return tokenRecord?.userId ?? null;
   }



}