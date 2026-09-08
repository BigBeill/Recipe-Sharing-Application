
export interface AuthTokensType {
   accessToken: string;
   refreshToken: string;
}

export interface AuthResultType {
   userId: string;
   tokens: AuthTokensType;
}

export interface JwtPayloadType {
   authId: string;
   issued?: number;
   expires?: number;
}

export interface SavedTokenType {
   userId: string;
   hash: string;
   expiresAt: Date;
}