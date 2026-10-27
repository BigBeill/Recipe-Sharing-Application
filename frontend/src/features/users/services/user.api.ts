import type { TypeApiCaller } from "@/shared/lib/api/types";
import { PaginatedListType } from "@/shared/domain/shared.types";
import { TypeImageReference } from "@/features/images/domain/image.types";
import { TypeRelationship, TypeUser } from "../domain/user.types";

export type PayloadUserApiGet = { includeRelationship: boolean };
export type PayloadUserApiProcessFriendRequest = { accept: boolean; }
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
      defineRelationship: (userId: string) =>
         call<TypeRelationship>({
            url: `/users/defineRelationship/${userId}`,
            method: 'get'
         }),
      get: (userId: string, body?: PayloadUserApiGet) =>
         call<TypeUser>({
            url: `/users/get/${userId}`,
            method: 'get',
            body,
         }),
      processFriendRequest: (relationshipId: string, body: PayloadUserApiProcessFriendRequest) =>
         call<TypeRelationship>({
            url:`/users/processFriendRequest/${relationshipId}`,
            method: 'post',
            body,
         }),
      removeFriend: (relationshipId: string) => 
         call<TypeRelationship>({
            url: `/users/removeFriend/${relationshipId}`,
            method: 'post',
         }),
      search: (body: PayloadUserApiSearch) =>
         call<PaginatedListType<TypeUser>>({
            url: `/users/search`,
            method: 'get',
            body,
         }),
      sendFriendRequest: (userId: string) =>
         call<TypeRelationship>({
            url: `/users/sendFriendRequest/${userId}`,
            method: 'post',
         }),
      update: (userId: string, body: PayloadUserApiUpdate) =>
         call<TypeUser>({
            url: `/users/update`,
            method: 'put',
            body,
         }),
   }
}

export type TypeUserApi = ReturnType<typeof createUserApi>;