import type { PaginatedListType } from "../../../common/api/apiResponse.types";
import removeMongooseNoise from "../../../common/utils/removeMongooseNoise";
import type { AuthService } from "../../auth/application/auth.service";
import type { RecipesService } from "../../recipes/application/recipes.service";
import type { AuthIdParam } from "../../../common/api/authIdParam";
import type { UsersRepository } from "../infrastructure/users.repository";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../../global/departingData/errorClasses";
import type { ImagesService } from "../../images/application/images.service";
import type { TypeRelationship, TypeUser } from "../domain/users.types";
import type { Types } from "mongoose";
import type { TypeImageReference } from "../../images/domain/images.types";

interface DefinedRelationshipParams {
   ownerId: Types.ObjectId;
   targetId: Types.ObjectId;
}

interface GetUserParams extends AuthIdParam{
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
   authId: Types.ObjectId;
   name?: string;
   email?: string;
   bio?: string;
   imageReference?: TypeImageReference;
}

export class UsersService {
   private readonly repository: UsersRepository;
   private readonly authService: AuthService;
   private readonly recipesService: RecipesService;
   private readonly imagesService: ImagesService;

   constructor({ usersRepository, authService, recipesService, imagesService }: { 
      usersRepository: UsersRepository, 
      authService: AuthService, 
      recipesService: RecipesService, 
      imagesService: ImagesService 
   }) {
      this.repository = usersRepository;
      this.authService = authService;
      this.recipesService = recipesService;
      this.imagesService = imagesService;
   }



   async findRelationship(params: DefinedRelationshipParams): Promise<TypeRelationship | null> {
      const { ownerId, targetId } = params;

      if (ownerId.equals(targetId)) { return null; }
      return await this.repository.findRelationship({ ownerId, targetId });
   }



   async deleteAccount(password: string, { authId }: AuthIdParam): Promise<boolean> {
      if (!authId) { throw new UnauthorizedError(); }

      // make sure the client know the password of the signed in account
      const validPassword = await this.authService.verifyPassword(authId, password);
      if (!validPassword) { throw new UnauthorizedError('Invalid Credentials'); }

      // delete any recipes associated with the account
      await this.recipesService.deleteManyRecipes(authId, { authId });

      // delete users avatar image
      const user = await this.repository.getUser(authId);
      if (user.imageReferenceId) { await this.imagesService.deleteImage(user.imageReferenceId); }

      await this.repository.deleteUser(authId);
      return true;
   }



   async deleteFriendship(_id: Types.ObjectId, { authId }: AuthIdParam): Promise<boolean> {
      if (!authId) { throw new UnauthorizedError(); }

      const friendship = await this.repository.getFriendship(_id);
      if (!friendship || !friendship.friendIds.some((_id) => _id.equals(authId))) { throw new UnauthorizedError('Invalid Credentials'); }

      await this.repository.deleteFriendship(_id);
      return true;
   }



   async getFriendIdList(userId: Types.ObjectId) {
      const friendshipList = await this.repository.searchFriendship(userId);
      
      // filter out the userId from each friendship and return an array of Ids
      return friendshipList.flatMap((friendship) => { return friendship.friendIds.filter((id) => !id.equals(userId)) });
   }



   async getUser(_id: Types.ObjectId, {authId, includeRelationship}: GetUserParams): Promise<TypeUser> {
      if(includeRelationship && !authId) { throw new UnauthorizedError(); }

      const [user, relationship] = await Promise.all([
         this.repository.getUser(_id),
         (includeRelationship ? this.findRelationship({ ownerId: _id, targetId: authId! }) : null),
      ]);
      return { ...removeMongooseNoise(user), ...(relationship != null && { relationship }) };
   }



   async sendFriendRequest(targetId: Types.ObjectId, { authId }: AuthIdParam): Promise<TypeRelationship> {
      if(!authId) { throw new UnauthorizedError(); }

      const friendRequest = await this.repository.createFriendRequest(authId, targetId)
      return {
         _id: friendRequest._id,
         ownerId: targetId,
         targetId: authId,
         type: 'requestReceived',
      }
   }



   async processFriendRequest(_id: Types.ObjectId, approve: boolean, { authId }: AuthIdParam): Promise<TypeRelationship | null> {
      if(!authId) { throw new UnauthorizedError(); }

      // get friendship from the database
      const friendRequest = await this.repository.getFriendRequest(_id);

      // check if friendship can be approved
      if (approve && friendRequest.receiverId.equals(authId)) {
         await this.repository.deleteFriendRequest(_id);
         const friendship = await this.repository.createFriendship([ friendRequest.senderId.toString(), friendRequest.receiverId.toString() ]);
         return {
            _id: friendship._id,
            ownerId: friendRequest.senderId,
            targetId: authId,
            type: "friend",
         }
      }

      // check if friendship can be declined
      else if (!approve && (friendRequest.receiverId.equals(authId) || friendRequest.senderId.equals(authId))) {
         await this.repository.deleteFriendRequest(_id);
         return null;
      }

      // whatever the client is attempting to do was not executable
      else { throw new UnauthorizedError('Invalid credentials'); }
   }



   async searchUsers(params: SearchUsersParams): Promise<PaginatedListType<TypeUser>> {
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



   async updateAccount(params: UpdateAccountParams): Promise<TypeUser> {
      const { authId, name, email, bio, imageReference } = params;

      const potentiallyConflictingUsers = await this.repository.searchUser({ name, email, searchExact: true });
      const conflictingUsersList = potentiallyConflictingUsers.list.filter((user) => { return user._id.equals(authId); })

      if(conflictingUsersList.length > 0) { throw new ConflictError("cant update users account"); }

      // replace the image if one has been provided
      if (imageReference) {
         const outdatedUserRecord = await this.repository.getUser(authId);
         if (!outdatedUserRecord.imageReferenceId?.equals(imageReference._id)) {
            if (outdatedUserRecord.imageReferenceId) { await this.imagesService.deleteImage(outdatedUserRecord.imageReferenceId); }
            await this.imagesService.claimImage(imageReference._id, { authId });
         }
      }

      const updatedUser = await this.repository.updateUser(authId, { name, email, bio, image: imageReference?._id });
      if (!updatedUser) { throw new NotFoundError("user not updated"); }
      return removeMongooseNoise(updatedUser);
   }



}