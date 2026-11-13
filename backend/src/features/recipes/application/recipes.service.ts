import type { RecipesRepository } from "../infrastructure/recipes.repository";
import type { IngredientsService } from "../../ingredients/application/ingredients.service";
import type { TypeNutrition, TypeRecipe, TypeRecipeDraft } from "../domain/recipes.types";
import type { TypeIngredient } from "../../ingredients/domain/ingredients.types";
import removeMongooseNoise from "../../../common/utils/removeMongooseNoise";
import { UnauthorizedError } from "../../../global/departingData/errorClasses";
import type { ImagesService } from "../../images/application/images.service";
import type { Types } from "mongoose";
import type { RecordRecipe, RecordRecipeDraft } from "../../../externalResources/database/mongoose/schemas/recipe.schema";
import type { TypePaginatedList } from "../../../common/domain/types.common";

interface GetRecipeListParams { 
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

   constructor({ recipesRepository, imagesService, ingredientsService }: { 
      recipesRepository: RecipesRepository, 
      imagesService: ImagesService, 
      ingredientsService: IngredientsService, 
   }) {
      this.repository = recipesRepository;
      this.imagesService = imagesService;
      this.ingredientsService = ingredientsService;
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



   async create(recipeDraft: TypeRecipeDraft): Promise<TypeRecipe> {
      const [claimedImageReference, nutrition] = await Promise.all([
         (recipeDraft.imageReference ? this.imagesService.claimImage(recipeDraft.imageReference._id) : undefined),
         this.calculateNutrition(recipeDraft),
      ]);
      const preparedRecord = await this.depopulate({ ...recipeDraft, nutrition, imageReference: claimedImageReference });
      const createdRecipe = await this.repository.create(preparedRecord);
      return this.populate(createdRecipe);
   }



   async delete(_id: Types.ObjectId): Promise<void> {
      const recipe = await this.repository.delete(_id);
      if (recipe.imageReferenceId) { await this.imagesService.delete(recipe.imageReferenceId); }
   }



   async deleteMany(ownerId: Types.ObjectId): Promise<void> {

      // get all the recipes that need to be deleted
      const recipes = await this.repository.search({ ownerIdList: [ownerId], visibilityList: ['public', 'personal', 'private'] });
      // check for images associated with the recipes and then delete both the images and recipes
      await Promise.all(recipes.list.map(async (recipe) => {
         if (recipe.imageReferenceId) { await this.imagesService.delete(recipe.imageReferenceId); }
         await this.repository.delete(recipe._id);
      }));
   }



   async depopulate(recipe: TypeRecipeDraft & { nutrition: TypeNutrition }): Promise<RecordRecipeDraft> {
      const { imageReference, ingredientList, ...rest } = recipe;
      return {
         ...rest,
         imageReferenceId: imageReference?._id,
         ingredientList: (await Promise.all(ingredientList.map((ingredient) => (this.ingredientsService.depopulate(ingredient)))))
      }
   }



   async get(_id: Types.ObjectId): Promise<TypeRecipe> {
      const recipeRecord = await this.repository.get(_id);
      const recipe = this.populate(recipeRecord);
      return recipe;
   }



   async populate(recipeRecord: RecordRecipe, knownFields?: { signedImageUrl?: string, ingredientList?: TypeIngredient[] }): Promise<TypeRecipe> {
      const { imageReferenceId, ...normalizedRecipe } = removeMongooseNoise(recipeRecord);

      const fetchSignedImageUrl = async (): Promise<string | undefined> => {
         if(knownFields?.signedImageUrl) { return knownFields.signedImageUrl; }
         else if(!imageReferenceId) { return undefined; }
         else { return await this.imagesService.getSignedURL(imageReferenceId); }
      }

      const fetchIngredientList = async (): Promise<TypeIngredient[]> => {
         if (knownFields?.ingredientList) { return knownFields.ingredientList; }
         else { return await Promise.all(normalizedRecipe.ingredientList.map(async (ingredient) => { return await this.ingredientsService.populate(ingredient); }) ); }
      }

      const [signedImageUrl, ingredientList] = await Promise.all([
         fetchSignedImageUrl(),
         fetchIngredientList(),
      ]);

      return { ...normalizedRecipe, signedImageUrl, ingredientList };
   }



   async search(params: GetRecipeListParams): Promise<TypePaginatedList<TypeRecipe>> {
      const { title, ownerIdList = [], ingredientIdList, visibilityList = ['public'], skip = 0, limit = 12 } = params;

      const recipes = await this.repository.search({ title, ingredientIdList, visibilityList, skip, limit });

      return {
         ...recipes,
         list: await Promise.all(recipes.list.map((recipe) => { return this.populate(recipe); })) 
      };
   }



   async update(_id: Types.ObjectId, updateFields: Partial<TypeRecipeDraft>): Promise<TypeRecipe> {
      const oldRecipeRecord = await this.repository.get(_id);

      const [nutrition, imageReference] = await Promise.all([
         (updateFields.ingredientList ? this.calculateNutrition({ ingredientList: updateFields.ingredientList }) : oldRecipeRecord.nutrition), // get the updated nutrition field
         (updateFields.imageReference ? this.imagesService.update(oldRecipeRecord.imageReferenceId ?? undefined, updateFields.imageReference) : undefined) // replace the image saved in the bucket
      ]);

      const returnedRecord = await this.repository.update(_id, { ...updateFields, nutrition, imageReferenceId: imageReference?._id });
      const signedImageUrl = imageReference ? await this.imagesService.getSignedURL(imageReference._id) : undefined;
      return this.populate(returnedRecord, { signedImageUrl: signedImageUrl, ingredientList: updateFields.ingredientList });
   }
   
}