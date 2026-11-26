import type {
   TypeRelationshipApi,
   PayloadUserApiProcessFriendRequest,
} from "./relationship.api";
import { TypeRelationship } from "../domain/relationship.types";

export function createRelationshipService(api: TypeRelationshipApi) {
   return {

      define: (userId: string): Promise<TypeRelationship> => {
         return api.define(userId);
      },

      processFriendRequest: (relationshipId: string, payload: PayloadUserApiProcessFriendRequest) => {
         console.log(payload);
         return api.processFriendRequest(relationshipId, payload);
      },

      removeFriend: (relationshipId: string) => {
         return api.removeFriend(relationshipId);
      },

      sendFriendRequest: (userId: string) => {
         return api.sendFriendRequest(userId);
      },
   }
}