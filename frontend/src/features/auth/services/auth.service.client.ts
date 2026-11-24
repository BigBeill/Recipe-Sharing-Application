import "client-only";

import { createAuthService, type AuthClientOnlyMethods } from "./auth.service";
import { createAuthApi } from "./auth.api";
import { checkValidEmail, checkValidPassword } from "./auth.utils";
import { ErrorValidation } from "@/shared/domain/errorClasses";
import callApiClient from "@/shared/lib/api/callApi.client";
import { authEvents } from "../providers/authentication.events.client";

const api = createAuthApi(callApiClient);

export const authService = {
   ...createAuthService(api),

   login: async (payload): Promise<void> => {
      checkValidPassword(payload.password);
      const response = await api.login(payload);
      authEvents.emit({ type: 'signedIn', session: { userId: response, roles: [] } });
   },

   logout: async () => { 
      await api.logout();
      authEvents.emit({ type: 'signedOut' })
   },

   register: async (payload) => {
      checkValidEmail(payload.email);
      checkValidPassword(payload.passwordOne);
      if (payload.passwordOne !== payload.passwordTwo) {
         throw new ErrorValidation('Register validation failed', [{ field: 'passwords', reasonList: ['do not match'] }]);
      }
      const response = await api.register({ name: payload.name, email: payload.email, password: payload.passwordOne });
      authEvents.emit({ type: 'signedIn', session: { userId: response, roles: [] } })
   },

   resetPassword: (payload) => {
      checkValidPassword(payload.password);
      return api.resetPassword(payload);
   },
} satisfies Omit<ReturnType<typeof createAuthService>, keyof AuthClientOnlyMethods> & AuthClientOnlyMethods;