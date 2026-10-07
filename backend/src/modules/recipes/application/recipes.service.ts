import { NotFoundError, UnauthorizedError } from "../../../common/types/error.types";
import type { RecipeRecord } from "../../../database/schemas/recipe.schema";
import type AuthIdParams from "../../../common/parameters/authId.parameters";
import type { ImagesService } from "../../images/images.service";
import type PaginationParams from "../../../common/parameters/pagination.parameters";
import type { PermissionsService } from "../../permissions/permissions.service";
import type { PaginatedListType } from "../../../common/types/return.types";
import type { RecipesRepository } from "../infrastructure/recipes.repository";
import type { IngredientsService } from "../../ingredients/application/ingredients.service";
import type { TypeNutrition, TypeRecipe, TypeRecipeDraft } from "../domain/recipes.types";
import type { TypeRecipeIngredient } from "../../ingredients/domain/ingredients.types";
import removeMongooseNoise from "../../../common/utils/removeMongooseNoise";

interface GetRecipeListParams extends PaginationParams { 
   authId?: string,
   title?: string,
   ownerIdList?: string[],
   ingredientIdList?: number[],
   visibilityList?: ('public' | 'private' | 'personal')[],
   includeCount?: boolean,
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



   async createRecipe(recipeDraft: TypeRecipeDraft, params: AuthIdParams): Promise<TypeRecipe> {
      const { authId } = params;
      if (!authId) { throw new UnauthorizedError(); }

      const [ image, nutrition ] = await Promise.all([
         recipeDraft.image ? this.imagesService.saveImage("recipes", recipeDraft.image.filename, authId) : undefined,
         this.getNutrition(recipeDraft.ingredientList),
      ]);

      const mongooseRecord = await this.repository.create({ ...recipeDraft, ownerId: authId, image, nutrition });

      return removeMongooseNoise(mongooseRecord) as TypeRecipe;
   }



   async deleteRecipe(_id: string, { authId }: AuthIdParams ): Promise<boolean> {
      const recipe = await this.repository.get(_id);
      if (!recipe) { throw new NotFoundError('Recipe not found'); }
      if (recipe.ownerId.toString() !== authId) { throw new UnauthorizedError(); }
      if (recipe.image) { await this.imagesService.deleteImage('recipes', recipe.image.filename); }
      await this.repository.delete(_id);
      return true;
   }



   async deleteManyRecipes(ownerId: string, { authId }: AuthIdParams): Promise<boolean> {

      // get all the recipes that need to be deleted
      const recipes = await this.repository.search({ ownerIdList: [ownerId], authId,  visibilityList: ['public', 'personal', 'private'] });

      // check for images associated with the recipes and then delete both the images and recipes
      await Promise.all(recipes.list.map(async (recipe) => {
         if (recipe.image) { await this.imagesService.deleteImage('recipes', recipe.image.filename); }
         await this.repository.delete(recipe._id.toString());
      }));

      return true;
   }



   async getNutrition(ingredientList: TypeRecipeIngredient[]): Promise<TypeNutrition> {
      const nutritionList = await Promise.all(ingredientList.map((ingredient) => this.ingredientsService.getNutrition(ingredient)));

      // combine each ingredients nutritional value
      return nutritionList.reduce(
         (accumulator, nutrition) => {
            for (const key of Object.keys(accumulator) as (keyof typeof accumulator)[]) { accumulator[key] += nutrition[key]; }
            return accumulator;
         }, 
         { calories: 0, fat: 0, cholesterol: 0, sodium: 0, potassium: 0, carbohydrates: 0, fibre: 0, sugar: 0, protein: 0 }
      );
   }



   async getRecipe(_id: string, { authId }: AuthIdParams): Promise<TypeRecipe> {
      const mongooseRecord = await this.repository.get(_id);
      if (!mongooseRecord) { throw new NotFoundError('Recipe not found')}

      // check for any reason a person should not be allowed to view this recipe
      if (mongooseRecord.visibility !== 'public'){
         if (!authId) { throw new UnauthorizedError(); }
         if ( mongooseRecord.visibility === 'personal' && mongooseRecord.ownerId.toString() !== authId) { throw new UnauthorizedError(); }
         if ( mongooseRecord.visibility === 'private' ) {
            const relationship = await this.permissionsService.defineRelationship({ authId, userId: mongooseRecord.ownerId.toString() });
            if (relationship.type !== 'friend') { throw new UnauthorizedError(); }
         }
      }

      const recipe = this.hydrateRecipe(mongooseRecord);
      return recipe;
   }



   async hydrateRecipe(record: RecipeRecord): Promise<TypeRecipe> {
      return {
         _id: record._id.toString(),
         ownerId: record.ownerId.toString(),
         title: record.title,
         description: record.description,
         image: record.image,
         ingredientList: await Promise.all(record.ingredientList.map(async (ingredient) => { return await this.ingredientsService.hydrateIngredient(ingredient); }) ),
         instructionList: record.instructionList,
         nutrition: record.nutrition,
         visibility: record.visibility,
      };
   }



   async searchRecipes(params: GetRecipeListParams): Promise<PaginatedListType<TypeRecipe>> {
      const { authId, title, ownerIdList = [], ingredientIdList, visibilityList = ['public'], skip = 0, limit = 12 } = params;

      let allowedOwnerIdList: string[] = ownerIdList;

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
         list: await Promise.all(recipes.list.map((recipe) => { return this.hydrateRecipe(recipe); })) 
      };
   }



   async updateRecipe(_id: string, recipeDraft: TypeRecipeDraft, params: AuthIdParams): Promise<boolean> {
      const { authId } = params;

      const oldRecipeRecord = await this.repository.get(_id);
      if (oldRecipeRecord.ownerId.toString() !== authId) { throw new UnauthorizedError(); }

      const newRecipeNutrition = await this.getNutrition(recipeDraft.ingredientList);

      if (recipeDraft.image && recipeDraft.image.filename !== oldRecipeRecord.image?.filename) { await this.imagesService.saveImage('recipes', recipeDraft.image.filename, authId); }

      await this.repository.update({ _id, ownerId: authId, nutrition: newRecipeNutrition, ...recipeDraft });
      return true;
   }
   
}