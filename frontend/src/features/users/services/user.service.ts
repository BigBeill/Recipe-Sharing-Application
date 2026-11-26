import { PaginatedListType } from "@/shared/domain/shared.types";
import type {
   TypeUserApi,
   PayloadUserApiGet,
   PayloadUserApiSearch,
   PayloadUserApiUpdate,
} from "./user.api";
import { TypeUser } from "../domain/user.types";

export function createUserService(api: TypeUserApi) {
   return {

      delete: (password: string): Promise<void> => {
         return api.delete({ password });
      },

      get: (userId: string, payload?: PayloadUserApiGet) => {
         return api.get(userId, payload);
      },

      search: (payload: PayloadUserApiSearch): Promise<PaginatedListType<TypeUser>> => {
         return api.search(payload);
      },

      update: (payload: PayloadUserApiUpdate): Promise<TypeUser> => {
         return api.update(payload);
      },
   }
}