import { checkValidEmail, checkValidPassword } from "./auth.utils";
import type {
   TypeAuthApi,
   PayloadAuthApiLogin,
   PayloadAuthApiRegister,
   PayloadAuthApiRequestPasswordReset,
   PayloadAuthApiResetPassword,
} from './auth.api';

export type AuthClientOnlyMethods = {
   login: (payload: PayloadAuthApiLogin) => Promise<void>;
   logout: () => Promise<void>;
   register: (payload: Omit<PayloadAuthApiRegister, 'password'> & { passwordOne: string, passwordTwo: string }) => Promise<void>;
   resetPassword: (Payload: PayloadAuthApiResetPassword) => Promise<void>;
};

function clientOnly<const Name extends keyof AuthClientOnlyMethods>(name: Name) {
   const message = `authService.${name} is only accessible through the .client implementation` as const;
   return (() => { throw new Error(message); }) as unknown as { readonly [K in typeof message]: never };
}

export function createAuthService(api: TypeAuthApi) {
   return {
      checkAuthStatus: (): Promise<string> => {
         return api.checkStatus();
      },

      requestPasswordReset: (payload: PayloadAuthApiRequestPasswordReset) => {
         checkValidEmail(payload.email);
         return api.requestPasswordReset(payload);
      },

      /** @deprecated authService.login is only accessible through the .client implementation */
      login: clientOnly('login'),
      /** @deprecated authService.logout is only accessible through the .client implementation */
      logout: clientOnly('logout'),
      /** @deprecated authService.register is only accessible through the .client implementation */
      register: clientOnly('register'),
      /** @deprecated authService.login is only accessible through the .client implementation */
      resetPassword: clientOnly('resetPassword'),
   };
}