import { NotFoundError, UnauthorizedError } from "../../common/types/error.types";
import type { RecipeRecord } from "../../common/mongo-db/schemas/recipe.schema";
import type AuthIdParams from "../../common/parameters/authId.parameters";
import removeMongooseNoise from "../../common/utils/removeMongooseNoise";
import type { ImagesService } from "../images/images.service";
import type { IngredientsService } from "../ingredients/ingredients.service";
import type { RecipesRepository } from "./recipes.repository";
import type { NutritionType, RecipeType } from "./recipes.types";
import type PaginationParams from "../../common/parameters/pagination.parameters";
import type { PermissionsService } from "../permissions/permissions.service";
import type { PaginatedListType } from "../../common/types/return.types";

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

   constructor(recipesRepository: RecipesRepository, imagesService: ImagesService, ingredientsService: IngredientsService, permissionsService: PermissionsService) {
      this.repository = recipesRepository;
      this.imagesService = imagesService;
      this.ingredientsService = ingredientsService;
      this.permissionsService = permissionsService;
   }



   async createRecipe(recipe: Omit<RecipeType, '_id' | 'ownerId' | 'nutrition'> & {nutrition?: NutritionType}, params: AuthIdParams): Promise<RecipeType> {
      const { authId } = params;
      if (!authId) { throw new UnauthorizedError(); }

      const [ image, nutrition ] = await Promise.all([
         recipe.image
            ? this.imagesService.saveImage("recipes", recipe.image.filename, authId)
            : undefined,
         this.ingredientsService.getNutrition(recipe.ingredientList)
      ]);

      const completedRecipe = {
         ...recipe,
         ownerId: authId,
         image,
         nutrition,
      }

      const mongooseRecord = await this.repository.createRecipe(completedRecipe);

      return {
         ...completedRecipe,
         _id: mongooseRecord._id.toString(),
      }
   }



   async deleteRecipe(_id: string, { authId }: AuthIdParams ): Promise<boolean> {
      const recipe = await this.repository.getRecipe(_id);
      if (!recipe) { throw new NotFoundError('Recipe not found'); }
      if (recipe.ownerId.toString() !== authId) { throw new UnauthorizedError(); }
      if (recipe.image) { await this.imagesService.deleteImage('recipes', recipe.image.filename); }
      await this.repository.deleteRecipe(_id);
      return true;
   }



   async deleteManyRecipes(ownerId: string): Promise<boolean> {

      // get all the recipes that need to be deleted
      const recipes = await this.repository.searchRecipes({ ownerIdList: [ownerId], visibilityList: ['public', 'personal', 'private'] });

      // check for images associated with the recipes and then delete both the images and recipes
      const promiseList = recipes.list.map(async (recipe) => {
         if (recipe.image) { await this.imagesService.deleteImage('recipes', recipe.image.filename); }
         await this.repository.deleteRecipe(recipe._id.toString());
      });

      await Promise.all(promiseList);
      return true;
   }



   async getRecipe(_id: string, { authId }: AuthIdParams): Promise<RecipeType> {
      const mongooseRecord = await this.repository.getRecipe(_id);
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



   async hydrateRecipe(record: RecipeRecord): Promise<RecipeType> {
      return {
         _id: record._id.toString(),
         ownerId: record.ownerId.toString(),
         title: record.title,
         description: record.description ?? '',
         image: record.image ?? undefined,
         ingredientList: await Promise.all(record.ingredientList.map(async (ingredient) => { return await this.ingredientsService.hydrateIngredient(ingredient); }) ),
         instructionList: record.instructionList,
         nutrition: record.nutrition ?? undefined,
         visibility: record.visibility,
      };
   }



   async searchRecipes(params: GetRecipeListParams): Promise<PaginatedListType<RecipeType>> {
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

      const recipes = await this.repository.searchRecipes({ title, ownerIdList: allowedOwnerIdList, visibilityList, skip, limit });

      return {
         ...recipes,
         list: await Promise.all(recipes.list.map((recipe) => { return this.hydrateRecipe(recipe); })) 
      };
   }



   async updateRecipe(recipe: Omit<RecipeType, 'nutrition'> & {nutrition?: NutritionType}, params: AuthIdParams): Promise<boolean> {
      const { authId } = params;

      const oldMongooseRecord = await this.repository.getRecipe(recipe._id);
      if(!oldMongooseRecord) { throw new NotFoundError('recipe not found'); }
      if (oldMongooseRecord.ownerId.toString() !== authId) { throw new UnauthorizedError(); }

      let recalculateNutrition = false;
      if (!recipe.nutrition || recipe.ingredientList.length !== oldMongooseRecord.ingredientList.length) { recalculateNutrition = true; }
      else {
         recipe.ingredientList.forEach((ingredient, index) => {
            const oldIngredient = oldMongooseRecord.ingredientList[index]!;
            if (
                  !oldIngredient.portion
               || !ingredient.portion
               || ingredient._id !== oldIngredient._id 
               || ingredient.portion._id !== oldIngredient.portion._id
               || ingredient.portion.amount !== oldIngredient.portion.amount
            ) { recalculateNutrition = true; }
         });
      }

      if (recalculateNutrition) {
         recipe.nutrition = await this.ingredientsService.getNutrition(recipe.ingredientList);
      }

      if (recipe.image && recipe.image.filename !== oldMongooseRecord.image?.filename) { await this.imagesService.saveImage('recipes', recipe.image.filename, authId); }

      // @ts-expect-error - nutrition is guaranteed to be defined by this point
      await this.repository.updateRecipe(recipe);
      return true;
   }


   
}