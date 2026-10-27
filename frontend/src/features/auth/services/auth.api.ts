// features/auth/services/authService.ts
import { TypeApiCaller } from "@/shared/lib/api/types";

export type PayloadAuthApiLogin = {
  name: string;
  password: string;
  rememberMe: boolean;
}
export type PayloadAuthApiRegister = {
  name: string;
  email: string;
  password: string;
}
export type PayloadAuthApiRequestPasswordReset = {
   email: string;
}
export type PayloadAuthApiResetPassword = {
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

      login: (body: PayloadAuthApiLogin): Promise<string> =>
         call({
            url: "/auth/login",
            method: "POST",
            body,
         }),

      logout: (): Promise<void> => 
         call({
            url: '/auth/logout',
            method: 'POST',
         }),

      register: (body: PayloadAuthApiRegister): Promise<string> =>
         call({
            url: "/auth/register",
            method: "POST",
            body,
         }),

      requestPasswordReset: (body: PayloadAuthApiRequestPasswordReset): Promise<void> =>
         call({
            url: "/auth/requestPasswordReset",
            method: "POST",
            body,
         }),

      resetPassword: (body: PayloadAuthApiResetPassword): Promise<void> =>
         call({
            url: "/auth/resetPassword",
            method: "POST",
            body,
         }),
   }
};

export type TypeAuthApi = ReturnType<typeof createAuthApi>;