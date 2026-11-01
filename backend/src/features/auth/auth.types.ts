import type { Types } from "mongoose";

export interface TypeAuthTokens {
   accessToken: string;
   refreshToken: string;
}

export interface TypeAuthResult {
   userId: Types.ObjectId;
   tokens: TypeAuthTokens;
}

export interface TypeJwtPayload {
   authId: Types.ObjectId;
   issued?: number;
   expires?: number;
}

export interface TypeSavedRefreshToken {
   userId: Types.ObjectId;
   hash: string;
   expiresAt: Date;
}

export interface TypeUserDraft {
   name: string;
   email: string;
   passwordHash: string;
}