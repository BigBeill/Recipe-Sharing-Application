import { checkValidEmail, checkValidPassword } from "./auth.utils";
import { ErrorValidation } from "@/shared/domain/errorClasses";
import type {
   TypeAuthApi,
   PayloadAuthApiLogin,
   PayloadAuthApiRegister,
   PayloadAuthApiRequestPasswordReset,
   PayloadAuthApiResetPassword,
} from './auth.api';

export function createAuthService(api: TypeAuthApi) {
   return {

      checkAuthStatus: (): Promise<string> => {
         return api.checkStatus();
      },

      login: async (payload: PayloadAuthApiLogin): Promise<string> => {
         checkValidPassword(payload.password);
         const response = await api.login(payload);
         return response;
      },

      logout: (): Promise<void> => {
         return api.logout();
      },

      register: (payload: Omit<PayloadAuthApiRegister, 'password'> & { passwordOne: string, passwordTwo: string }): Promise<string> => {
         checkValidEmail(payload.email);
         checkValidPassword(payload.passwordOne);
         if (payload.passwordOne != payload.passwordTwo) { throw new ErrorValidation('Register validation failed', [{ field: 'passwords', reasonList: ['do not match'] }]); }
         return api.register({ name: payload.name, email: payload.email, password: payload.passwordOne });
      },

      requestPasswordReset: (payload: PayloadAuthApiRequestPasswordReset) => {
         checkValidEmail(payload.email);
         return api.requestPasswordReset(payload);
      },

      resetPassword: (payload: PayloadAuthApiResetPassword) => {
         checkValidPassword(payload.password);
         return api.resetPassword(payload);
      },

   }
}