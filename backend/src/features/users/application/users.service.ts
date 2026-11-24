import removeMongooseNoise from "../../../common/utils/removeMongooseNoise";
import type { RecipesService } from "../../recipes/application/recipes.service";
import type { UsersRepository } from "../infrastructure/users.repository";
import type { ImagesService } from "../../images/application/images.service";
import type { TypeUser } from "../domain/users.types";
import type { Types } from "mongoose";
import type { TypeImageReference } from "../../images/domain/images.types";
import type { TypePaginatedList } from "../../../common/domain/types.common";
import { Reauthenticate } from "../../authorization/decorators/Reauthenticate";
import type { AuthorizationService, ReauthenticationProof } from "../../authorization/authorization.service";
import { AccessControlled } from "../../authorization/decorators/AccessControlled.function";
import type { RelationshipsService } from "../../relationships/application/relationships.service";
import { hashPassword } from "../../../common/utils/password";
import type { AuthenticationService } from "../../authentication/application/authentication.service";
import type { TypeAuthResult } from "../../authentication/domain/auth.types";
import { Protected } from "../../authorization/decorators/Protected";
import { AppErrorConflict, AppErrorNotFound, AppErrorUnauthorized } from "../../../global/departingData/errorClasses";



interface GetUserParams {
   includeRelationship?: boolean;
}

interface SearchUsersParams {
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

interface RegisterParams {
   name: string, 
   email: string, 
   password: string,
}



export class UsersService extends AccessControlled {
   private readonly repository: UsersRepository;
   private readonly recipesService: RecipesService;
   private readonly imagesService: ImagesService;
   private readonly relationshipService: RelationshipsService;
   private readonly authenticationService: AuthenticationService;

   constructor({ authorizationService, usersRepository, recipesService, imagesService, relationshipsService, authenticationService }: { 
      authorizationService: AuthorizationService,
      usersRepository: UsersRepository, 
      recipesService: RecipesService, 
      imagesService: ImagesService,
      relationshipsService: RelationshipsService,
      authenticationService: AuthenticationService,
   }) {
      super({ authorizationService });
      this.repository = usersRepository;
      this.recipesService = recipesService;
      this.imagesService = imagesService;
      this.relationshipService = relationshipsService;
      this.authenticationService = authenticationService;  
   }



   @Reauthenticate
   async changePassword(_reauthenticationProof: ReauthenticationProof, newPassword: string ): Promise<void> {
      const passwordHash = await hashPassword(newPassword);
      await this.repository.updatePassword(passwordHash);
   }



   @Reauthenticate
   async delete(_reauthenticationProof: ReauthenticationProof): Promise<void> {

      // delete any recipes associated with the account
      await this.recipesService.deleteMany();

      // delete users avatar image
      const user = await this.repository.getUser(this.authorization.requireClientId());
      if (user.imageReferenceId) { await this.imagesService.delete(user.imageReferenceId); }

      await this.repository.delete();
   }



   async get(_id: Types.ObjectId, { includeRelationship }: GetUserParams): Promise<TypeUser> {
      const [user, relationship] = await Promise.all([
         this.repository.getUser(_id),
         (includeRelationship ? this.relationshipService.findRelationship({ ownerId: _id, targetId: this.authorization.requireClientId() }) : null),
      ]);
      return { ...removeMongooseNoise(user), ...(relationship != null && { relationship }) };
   }



   async create(params: RegisterParams): Promise<TypeAuthResult> {
      const { name, email, password } = params;

      const conflictingUserList = await this.repository.searchUserExact({ name, email });
      if (conflictingUserList.length > 0) {
         if ( conflictingUserList[0]?.name === name ) { throw new AppErrorConflict("username"); }
         else { throw new AppErrorConflict("email"); }
      }
      
      const passwordHash = await hashPassword(password);
      const user = await this.repository.create({ name, email, passwordHash });

      const refreshExpiresAt = new Date(Date.now() + (60 * 60 * 24 * 1000)) // 1 day in milliseconds

      return this.authenticationService.buildAuthResult(user._id, { expiresAt: refreshExpiresAt });
   }



   async searchUsers(params: SearchUsersParams): Promise<TypePaginatedList<TypeUser>> {
      const { _id, name, skip, limit, includeRelationship } = params;
      if (includeRelationship && !this.authorization.clientId) { throw new AppErrorUnauthorized(); }

      const users = removeMongooseNoise(await this.repository.searchUser({ _id, name, skip, limit }));
      if (!includeRelationship) { return users; }
      else {
         const list = await Promise.all(users.list.map(async (user) => {
            const relationship = await this.relationshipService.findRelationship({ ownerId: user._id, targetId: this.authorization.requireClientId() });
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



   @Protected
   async resetPassword(password: string): Promise<void> {

      // hash the new password and remove any old instances of password reset requests
      await Promise.all([
         this.repository.updatePassword(await hashPassword(password)),
         this.authenticationService.cleanSavedTokens(this.authorization.requireClientId()),
      ]);
   }



   async update(params: UpdateAccountParams): Promise<TypeUser> {
      const { name, email, bio, imageReference } = params;

      const potentiallyConflictingUsers = await this.repository.searchUser({ name, email, searchExact: true });
      const conflictingUsersList = potentiallyConflictingUsers.list.filter((user) => { return !user._id.equals(this.authorization.requireClientId()); })

      if(conflictingUsersList.length > 0) { throw new AppErrorConflict("cant update users account"); }

      // replace the image if one has been provided
      if (imageReference) {
         const outdatedUserRecord = await this.repository.getUser(this.authorization.requireClientId());
         if (!outdatedUserRecord.imageReferenceId?.equals(imageReference._id)) {
            if (outdatedUserRecord.imageReferenceId) { await this.imagesService.delete(outdatedUserRecord.imageReferenceId); }
            await this.imagesService.claimImage(imageReference._id);
         }
      }

      const updatedUser = await this.repository.updateUser({ name, email, bio, imageReferenceId: imageReference?._id });
      if (!updatedUser) { throw new AppErrorNotFound("user"); }
      return removeMongooseNoise(updatedUser);
   }



}