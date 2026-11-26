import type { TypeApiCaller } from "@/shared/lib/api/types";
import { TypeRelationship } from "../domain/relationship.types";

export type PayloadUserApiProcessFriendRequest = { approve: boolean; }

export function createRelationshipApi(call: TypeApiCaller) {
   return {
      define: (userId: string) =>
         call<TypeRelationship>({
            url: `/relationships/defineRelationship/${userId}`,
            method: 'get'
         }),
      processFriendRequest: (relationshipId: string, body: PayloadUserApiProcessFriendRequest) =>
         call<TypeRelationship>({
            url:`/relationships/processFriendRequest/${relationshipId}`,
            method: 'post',
            body,
         }),
      removeFriend: (relationshipId: string) => 
         call<TypeRelationship>({
            url: `/relationships/removeFriend/${relationshipId}`,
            method: 'post',
         }),
      sendFriendRequest: (userId: string) =>
         call<TypeRelationship>({
            url: `/relationships/sendFriendRequest/${userId}`,
            method: 'post',
         }),
   }
}

export type TypeRelationshipApi = ReturnType<typeof createRelationshipApi>;