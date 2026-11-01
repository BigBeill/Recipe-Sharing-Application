import type { Types } from "mongoose";
import type { UsersRepository } from "../users/infrastructure/users.repository";
import type { TypeRelationship } from "../users/domain/users.types";

export class PermissionsService {
   private readonly repository: UsersRepository;

   constructor({ usersRepository }: { usersRepository: UsersRepository }) {
      this.repository = usersRepository;
   }

   async defineRelationship(params: { authId: Types.ObjectId, targetId: Types.ObjectId }): Promise<TypeRelationship | null> {
      const { authId, targetId } = params;

      if (authId.equals(targetId)) { return null; }

      return await this.repository.findRelationship({ ownerId: authId, targetId });
   }

   async getFriendIdList(userId: Types.ObjectId): Promise<Types.ObjectId[]> {
      const friendshipList = await this.repository.searchFriendship(userId);
      
      // filter out the userId from each friendship and return an array of Ids
      return friendshipList.flatMap((friendship) => { return friendship.friendIds.filter((id) => !id.equals(userId)) });
   }
}