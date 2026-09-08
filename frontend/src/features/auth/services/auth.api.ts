// features/auth/services/authService.ts
import { TypeApiCaller } from "@/shared/lib/api/types";

export type TypeAuthServiceLoginParams = {
  name: string;
  password: string;
  rememberMe: boolean;
}
export type TypeAuthServiceRegisterParams = {
  name: string;
  email: string;
  password: string;
}
export type TypeAuthServiceRequestPasswordResetParams = {
   email: string;
}
export type TypeAuthServiceResetPasswordParams = {
  token: string;
  password: string;
}

export function createAuthApi(call: TypeApiCaller) {
   return {

      checkStatus: (): Promise<string> => 
         call({
            url: '/auth/status',
            method: 'GET'
         }),

      login: (params: TypeAuthServiceLoginParams): Promise<{ _id: string }> =>
         call({
            url: "/auth/login",
            method: "POST",
            body: params,
         }),

      logout: (): Promise<void> => 
         call({
            url: '/auth/logout',
            method: 'POST',
         }),

      register: (params: TypeAuthServiceRegisterParams): Promise<{ _id: string }> =>
         call({
            url: "/auth/register",
            method: "POST",
            body: params,
         }),

      requestPasswordReset: (params: TypeAuthServiceRequestPasswordResetParams): Promise<void> =>
         call({
            url: "/auth/requestPasswordReset",
            method: "POST",
            body: params,
         }),

      resetPassword: (params: TypeAuthServiceResetPasswordParams): Promise<void> =>
         call({
            url: "/auth/resetPassword",
            method: "POST",
            body: params,
         }),
   }
};

export type TypeAuthApi = ReturnType<typeof createAuthApi>;