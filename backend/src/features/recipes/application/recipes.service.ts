import type { PermissionsService } from "../../permissions/permissions.service";
import type { PaginatedListType } from "../../../common/api/apiResponse.types";
import type { RecipesRepository } from "../infrastructure/recipes.repository";
import type { IngredientsService } from "../../ingredients/application/ingredients.service";
import type { TypeNutrition, TypeRecipe, TypeRecipeDraft } from "../domain/recipes.types";
import type { TypeIngredient } from "../../ingredients/domain/ingredients.types";
import removeMongooseNoise from "../../../common/utils/removeMongooseNoise";
import type { AuthIdParam } from "../../../common/api/authIdParam";
import { NotFoundError, UnauthorizedError } from "../../../global/departingData/errorClasses";
import type { ImagesService } from "../../images/application/images.service";
import type { Types } from "mongoose";
import type { TypeImageReference } from "../../images/domain/images.types";
import type { RecordRecipe } from "../../../externalResources/database/mongoose/schemas/recipe.schema";

interface GetRecipeListParams { 
   authId?: Types.ObjectId,
   title?: string,
   ownerIdList?: Types.ObjectId[],
   ingredientIdList?: number[],
   visibilityList?: ('public' | 'private' | 'personal')[],
   includeCount?: boolean,
   skip?: number,
   limit?: number,
}

export class RecipesService { 
   private readonly repository: RecipesRepository;
   private readonly imagesService: ImagesService;
   private readonly ingredientsService: IngredientsService;
   private readonly permissionsService: PermissionsService;

   constructor({ recipesRepository, imagesService, ingredientsService, permissionsService }: { 
      recipesRepository: RecipesRepository, 
      imagesService: ImagesService, 
      ingredientsService: IngredientsService, 
      permissionsService: PermissionsService }
   ) {
      this.repository = recipesRepository;
      this.imagesService = imagesService;
      this.ingredientsService = ingredientsService;
      this.permissionsService = permissionsService;
   }



   async calculateNutrition(recipe: { ingredientList: { _id: number, portion: { _id: number, amount: number } }[] }): Promise<TypeNutrition> {
      const nutritionList = await Promise.all(recipe.ingredientList.map((ingredient) => this.ingredientsService.calculateNutrition(ingredient)));

      // combine each ingredients nutritional value
      return nutritionList.reduce(
         (accumulator, nutrition) => {
            for (const key of Object.keys(accumulator) as (keyof typeof accumulator)[]) { accumulator[key] += nutrition[key]; }
            return accumulator;
         }, 
         { calories: 0, fat: 0, cholesterol: 0, sodium: 0, potassium: 0, carbohydrates: 0, fibre: 0, sugar: 0, protein: 0 }
      );
   }



   async create(recipeDraft: TypeRecipeDraft, params: AuthIdParam): Promise<TypeRecipe> {
      const { authId } = params;
      if (!authId) { throw new UnauthorizedError(); }

      const [claimedImageReference, nutrition] = await Promise.all([
         (recipeDraft.imageReference ? this.imagesService.claimImage(recipeDraft.imageReference._id, { authId }) : undefined),
         this.calculateNutrition(recipeDraft),
      ]);

      const mongooseRecord = await this.repository.create({ ...recipeDraft, ownerId: authId, imageReferenceId: claimedImageReference?._id, nutrition });

      return this.populate(mongooseRecord);
   }



   async delete(_id: Types.ObjectId, { authId }: AuthIdParam): Promise<boolean> {
      const recipe = await this.repository.get(_id);
      if (!recipe) { throw new NotFoundError('Recipe not found'); }
      if (!recipe.ownerId.equals(authId)) { throw new UnauthorizedError(); }
      if (recipe.imageReferenceId) { await this.imagesService.delete(recipe.imageReferenceId); }
      await this.repository.delete(_id);
      return true;
   }



   async deleteMany(ownerId: Types.ObjectId, { authId }: AuthIdParam): Promise<boolean> {

      // get all the recipes that need to be deleted
      const recipes = await this.repository.search({ ownerIdList: [ownerId], authId,  visibilityList: ['public', 'personal', 'private'] });

      // check for images associated with the recipes and then delete both the images and recipes
      await Promise.all(recipes.list.map(async (recipe) => {
         if (recipe.imageReferenceId) { await this.imagesService.delete(recipe.imageReferenceId); }
         await this.repository.delete(recipe._id);
      }));

      return true;
   }



   async get(_id: Types.ObjectId, { authId }: AuthIdParam): Promise<TypeRecipe> {
      const recipeRecord = await this.repository.get(_id);

      // ? check for any reason a person should not be allowed to view this recipe
      if (recipeRecord.visibility !== 'public'){
         if (!authId) { throw new UnauthorizedError("Unauthenticated users do not have access to recipes that are not marked as public"); }
         if (!recipeRecord.ownerId.equals(authId)){
            if (recipeRecord.visibility === 'personal') { throw new UnauthorizedError("Authenticated user does not have read access for this recipe"); }
            const relationship = await this.permissionsService.defineRelationship({ authId, targetId: recipeRecord.ownerId });
            if (!relationship || relationship.type !== 'friend') { throw new UnauthorizedError("Authenticated user does not have read access for this recipe"); }
         }
      }

      const recipe = this.populate(recipeRecord);
      return recipe;
   }



   async populate(recipeRecord: RecordRecipe, knownFields?: { imageReference?: TypeImageReference, ingredientList?: TypeIngredient[] }): Promise<TypeRecipe> {
      const { imageReferenceId, ...normalizedRecipe } = removeMongooseNoise(recipeRecord);

      const fetchImageReference = async (): Promise<TypeImageReference | undefined> => {
         if(knownFields?.imageReference) { return knownFields.imageReference; }
         else if(!imageReferenceId) { return undefined; }
         else { return await this.imagesService.getImageReference(imageReferenceId); }
      }

      const fetchIngredientList = async (): Promise<TypeIngredient[]> => {
         if (knownFields?.ingredientList) { return knownFields.ingredientList; }
         else { return await Promise.all(normalizedRecipe.ingredientList.map(async (ingredient) => { return await this.ingredientsService.populate(ingredient); }) ); }
      }

      const [imageReference, ingredientList] = await Promise.all([
         fetchImageReference(),
         fetchIngredientList(),
      ]);

      return { ...normalizedRecipe, imageReference, ingredientList };
   }



   async search(params: GetRecipeListParams): Promise<PaginatedListType<TypeRecipe>> {
      const { authId, title, ownerIdList = [], ingredientIdList, visibilityList = ['public'], skip = 0, limit = 12 } = params;

      let allowedOwnerIdList = ownerIdList;

      if (visibilityList.includes('private')) {
         if (!authId) { throw new UnauthorizedError(); }
         const friendIdList = await this.permissionsService.getFriendIdList(authId);
         allowedOwnerIdList.push(...friendIdList);
      }
      if (visibilityList.includes('personal')) {
         if (!authId) { throw new UnauthorizedError(); }
         allowedOwnerIdList.push(authId);
      }

      // remove any ownerIds from OwnerIdList that the calling function isn't requesting
      if (allowedOwnerIdList && ownerIdList){
         allowedOwnerIdList = allowedOwnerIdList.filter(item => ownerIdList.includes(item));
      }

      const recipes = await this.repository.search({ title, authId, ownerIdList: allowedOwnerIdList, ingredientIdList, visibilityList, skip, limit });

      return {
         ...recipes,
         list: await Promise.all(recipes.list.map((recipe) => { return this.populate(recipe); })) 
      };
   }



   async update(_id: Types.ObjectId, updateFields: Partial<TypeRecipeDraft>, params: AuthIdParam): Promise<TypeRecipe> {
      const { authId } = params;
      if(!authId) { throw new UnauthorizedError("AuthId was not provided to recipeService.update"); }
      console.log(updateFields);

      const oldRecipeRecord = await this.repository.get(_id);
      if (!oldRecipeRecord.ownerId.equals(authId)) { throw new UnauthorizedError(`Authenticated user does not have write access to recipe: ${ _id }`); }

      const [nutrition, imageReference] = await Promise.all([
         (updateFields.ingredientList ? this.calculateNutrition({ ingredientList: updateFields.ingredientList }) : oldRecipeRecord.nutrition), // get the updated nutrition field
         (updateFields.imageReference ? this.imagesService.update(oldRecipeRecord.imageReferenceId ?? undefined, updateFields.imageReference, { authId }) : undefined) // replace the image saved in the bucket
      ]);

      const returnedRecord = await this.repository.update(_id, { ...updateFields, nutrition, imageReferenceId: imageReference?._id });
      return this.populate(returnedRecord, { imageReference: imageReference, ingredientList: updateFields.ingredientList });
   }
   
}