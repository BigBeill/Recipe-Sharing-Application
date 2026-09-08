import type { TypeApiCaller } from "@/shared/lib/api/types";
import { RelationshipType, UserType } from "../domain/user.types"
import { PaginatedListType } from "@/shared/shared.types";

export type TypeUserServiceGetParam = { includeRelationship: boolean };
export type TypeUserServiceProcessFriendRequestParams = { accept: boolean; }
export type TypeUserServiceSearchParams = {
   _id?: string
   name?: string
   category?: 'friends' | 'incomingRequests' | 'outgoingRequests' | 'none';
   skip?: number;
   limit?: number;
}

export function createUserApi(call: TypeApiCaller) {
   return {
      defineRelationship: (userId: string) =>
         call<RelationshipType>({
            url: `/users/defineRelationship/${userId}`,
            method: 'get'
         }),
      get: (userId: string, params?: TypeUserServiceGetParam) =>
         call<UserType>({
            url: `/users/get/${userId}`,
            method: 'get',
            body: params,
         }),
      processFriendRequest: (relationshipId: string, params: TypeUserServiceProcessFriendRequestParams) =>
         call<RelationshipType>({
            url:`/users/processFriendRequest/${relationshipId}`,
            method: 'post',
            body: params,
         }),
      removeFriend: (relationshipId: string) => 
         call<RelationshipType>({
            url: `/users/removeFriend/${relationshipId}`,
            method: 'post',
         }),
      search: (params: TypeUserServiceSearchParams) =>
         call<PaginatedListType<UserType>>({
            url: `/users/search`,
            method: 'get',
            body: params
         }),
      sendFriendRequest: (userId: string) =>
         call<RelationshipType>({
            url: `/users/sendFriendRequest/${userId}`,
            method: 'post',
         }),
      update: (user: FormData) =>
         call<UserType>({
            url: `/users/update`,
            method: 'put',
            body: { user },
         }),
   }
}

export type TypeUserApi = ReturnType<typeof createUserApi>;