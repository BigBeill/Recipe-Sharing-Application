import { checkValidEmail, checkValidPassword } from "./auth.utils";
import { ErrorValidation } from "@/shared/lib/api/errorClasses";
import type {
   TypeAuthApi,
   TypeAuthServiceLoginParams,
   TypeAuthServiceRegisterParams,
   TypeAuthServiceRequestPasswordResetParams,
   TypeAuthServiceResetPasswordParams,
} from './auth.api';

export function createAuthService(api: TypeAuthApi) {
   return {

      checkAuthStatus: (): Promise<string> => {
         return api.checkStatus();
      },

      login: (params: TypeAuthServiceLoginParams): Promise<{ _id: string }> => {
         checkValidPassword(params.password);
         return api.login({ name: params.name, password: params.password, rememberMe: params.rememberMe });
      },

      logout: (): Promise<void> => {
         return api.logout();
      },

      register: (params: Omit<TypeAuthServiceRegisterParams, 'password'> & { passwordOne: string, passwordTwo: string }): Promise<{ _id: string }> => {
         checkValidEmail(params.email);
         checkValidPassword(params.passwordOne);
         if (params.passwordOne != params.passwordTwo) { throw new ErrorValidation([{ field: 'passwords', issueList: ['do not match'] }]); }
         return api.register({ name: params.name, email: params.email, password: params.passwordOne });
      },

      requestPasswordReset: (params: TypeAuthServiceRequestPasswordResetParams) => {
         checkValidEmail(params.email);
         return api.requestPasswordReset(params);
      },

      resetPassword: (params: TypeAuthServiceResetPasswordParams) => {
         checkValidPassword(params.password);
         return api.resetPassword(params);
      },

   }
}