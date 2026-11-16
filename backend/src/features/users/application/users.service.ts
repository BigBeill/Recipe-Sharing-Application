import removeMongooseNoise from "../../../common/utils/removeMongooseNoise";
import type { RecipesService } from "../../recipes/application/recipes.service";
import type { UsersRepository } from "../infrastructure/users.repository";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../../global/departingData/errorClasses";
import type { ImagesService } from "../../images/application/images.service";
import type { TypeRelationship, TypeUser } from "../domain/users.types";
import type { Types } from "mongoose";
import type { TypeImageReference } from "../../images/domain/images.types";
import type { TypePaginatedList } from "../../../common/domain/types.common";
import { ScopeAware } from "../../../common/decorators/scopeAware";
import { Reauthenticate } from "../../authentication/decorators/Reauthenticate";
import type { AuthorizationService } from "../../authorization/authorization.service";

interface DefinedRelationshipParams {
   ownerId: Types.ObjectId;
   targetId: Types.ObjectId;
}

interface GetUserParams {
   includeRelationship?: boolean;
}

interface SearchUsersParams {
   authId?: Types.ObjectId,
   _id?: Types.ObjectId,
   name?: string,
   includeRelationship?: boolean,
   skip?: number,
   limit?: number,
}

interface UpdateAccountParams {
   name?: string;
   email?: string;
   bio?: string;
   imageReference?: TypeImageReference;
}

@ScopeAware
export class UsersService {
   private readonly repository: UsersRepository;
   private readonly recipesService: RecipesService;
   private readonly imagesService: ImagesService;
   private readonly authorization: AuthorizationService;

   constructor({ usersRepository, recipesService, imagesService, authorization }: { 
      usersRepository: UsersRepository, 
      recipesService: RecipesService, 
      imagesService: ImagesService,
      authorization: AuthorizationService,
   }) {
      this.repository = usersRepository;
      this.recipesService = recipesService;
      this.imagesService = imagesService;
      this.authorization = authorization;
   }



   @Reauthenticate
   async deleteAccount(_ReauthenticateParams: { password: string }): Promise<boolean> {

      // delete any recipes associated with the account
      await this.recipesService.deleteMany();

      // delete users avatar image
      const user = await this.repository.getUser(this.authorization.requireClientId());
      if (user.imageReferenceId) { await this.imagesService.delete(user.imageReferenceId); }

      await this.repository.deleteUser();
      return true;
   }



   async deleteFriendship(_id: Types.ObjectId): Promise<void> {
      await this.repository.deleteFriendship(_id);
   }



   async findRelationship(params: DefinedRelationshipParams): Promise<TypeRelationship | null> {
      const { ownerId, targetId } = params;
      return await this.repository.findRelationship({ targetId, ownerId });
   }



   async getFriendIdList(userId: Types.ObjectId) {
      const friendshipList = await this.repository.searchFriendship(userId);
      
      // filter out the userId from each friendship and return an array of Ids
      return friendshipList.flatMap((friendship) => { return friendship.friendIds.filter((id) => !id.equals(userId)) });
   }



   async get(_id: Types.ObjectId, { includeRelationship }: GetUserParams): Promise<TypeUser> {
      const [user, relationship] = await Promise.all([
         this.repository.getUser(_id),
         (includeRelationship ? this.findRelationship({ ownerId: _id, targetId: this.authorization.requireClientId() }) : null),
      ]);
      return { ...removeMongooseNoise(user), ...(relationship != null && { relationship }) };
   }



   async sendFriendRequest(targetId: Types.ObjectId): Promise<TypeRelationship> {
      const friendRequest = await this.repository.createFriendRequest(targetId);
      return {
         _id: friendRequest._id,
         ownerId: targetId,
         targetId: this.authorization.requireClientId(),
         type: 'requestReceived',
      }
   }



   async processFriendRequest(_id: Types.ObjectId, approve: boolean): Promise<TypeRelationship | null> {
      // get friendship from the database
      const friendRequest = await this.repository.getFriendRequest(_id);

      // check if friendship can be approved
      if (approve && friendRequest.receiverId.equals(this.authorization.clientId)) {
         const friendship = await this.repository.createFriendship(friendRequest.senderId);
         return {
            _id: friendship._id,
            ownerId: friendRequest.senderId,
            targetId: this.authorization.requireClientId(),
            type: "friend",
         }
      }

      // check if friendship can be declined
      else if (!approve && (friendRequest.receiverId.equals(this.authorization.clientId) || friendRequest.senderId.equals(this.authorization.clientId))) {
         await this.repository.deleteFriendRequest(_id);
         return null;
      }

      // whatever the client is attempting to do was not executable
      else { throw new UnauthorizedError('Invalid credentials'); }
   }



   async searchUsers(params: SearchUsersParams): Promise<TypePaginatedList<TypeUser>> {
      const { authId, _id, name, skip, limit, includeRelationship } = params;
      if (includeRelationship && !authId) { throw new UnauthorizedError('Include relationship flag cannot be set to true without a valid session'); }

      const users = removeMongooseNoise(await this.repository.searchUser({ _id, name, skip, limit }));
      if (!includeRelationship) { return users; }
      else {
         const list = await Promise.all(users.list.map(async (user) => {
            const relationship = await this.findRelationship({ ownerId: user._id, targetId: authId! });
            return {
               ...user,
               relationship
            }
         }));
         return {
            ...users,
            list,
         }
      }
   }



   async update(params: UpdateAccountParams): Promise<TypeUser> {
      const { name, email, bio, imageReference } = params;

      const potentiallyConflictingUsers = await this.repository.searchUser({ name, email, searchExact: true });
      const conflictingUsersList = potentiallyConflictingUsers.list.filter((user) => { return !user._id.equals(this.authorization.requireClientId()); })

      if(conflictingUsersList.length > 0) { throw new ConflictError("cant update users account"); }

      // replace the image if one has been provided
      if (imageReference) {
         const outdatedUserRecord = await this.repository.getUser(this.authorization.requireClientId());
         if (!outdatedUserRecord.imageReferenceId?.equals(imageReference._id)) {
            if (outdatedUserRecord.imageReferenceId) { await this.imagesService.delete(outdatedUserRecord.imageReferenceId); }
            await this.imagesService.claimImage(imageReference._id);
         }
      }

      const updatedUser = await this.repository.updateUser({ name, email, bio, imageReferenceId: imageReference?._id });
      if (!updatedUser) { throw new NotFoundError("user not updated"); }
      return removeMongooseNoise(updatedUser);
   }



}