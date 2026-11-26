import type { TypeApiCaller } from "@/shared/lib/api/types";
import { PaginatedListType } from "@/shared/domain/shared.types";
import { TypeImageReference } from "@/features/images/domain/image.types";
import { TypeUser } from "../domain/user.types";

export type PayloadUserApiGet = { includeRelationship: boolean };
export type PayloadUserApiSearch = {
   _id?: string
   name?: string
   category?: 'friends' | 'incomingRequests' | 'outgoingRequests' | 'none';
   skip?: number;
   limit?: number;
}
export type PayloadUserApiUpdate = {
   name?: string;
   email?: string;
   bio?: string;
   imageReference?: TypeImageReference;
}

export function createUserApi(call: TypeApiCaller) {
   return {
      delete: (body: { password: string }) => 
         call<void>({
            url: `/users/delete`,
            method: 'post',
            body,
         }),
      get: (userId: string, body?: PayloadUserApiGet) =>
         call<TypeUser>({
            url: `/users/get/${userId}`,
            method: 'get',
            body,
         }),
      search: (body: PayloadUserApiSearch) =>
         call<PaginatedListType<TypeUser>>({
            url: `/users/search`,
            method: 'get',
            body,
         }),
      update: (body: PayloadUserApiUpdate) =>
         call<TypeUser>({
            url: `/users/update`,
            method: 'put',
            body,
         }),
   }
}

export type TypeUserApi = ReturnType<typeof createUserApi>;