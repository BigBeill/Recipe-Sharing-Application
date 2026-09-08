import { RecipeModel, type RecipeRecord } from "../../common/mongo-db/schemas/recipe.schema";
import type { PaginatedListType } from "../../common/types/return.types";
import { escapeRegex } from "../../common/utils/filter";
import type { RecipeType } from "./recipes.types";
import { toStoredRecipe } from "./recipes.utils";

interface GetRecipeListParams {
   title?: string;
   ownerIdList?: string[];
   ingredientIdList?: number[];
   visibilityList: ('public' | 'private' | 'personal')[];
   skip?: number;
   limit?: number;
}

export class RecipesRepository {

   async createRecipe(recipe: Omit<RecipeType, '_id'>): Promise<RecipeRecord> {
      const savedRecipe = await RecipeModel.create(toStoredRecipe(recipe));
      return savedRecipe.toObject();
   }

   async deleteRecipe(_id: string): Promise<void> {
      await RecipeModel.deleteOne({ _id });
   }

   async getRecipe(_id: string): Promise<RecipeRecord | null> {
      return RecipeModel.findOne({ _id }).lean<RecipeRecord | null>();
   }

   async searchRecipes(params: GetRecipeListParams): Promise<PaginatedListType<RecipeRecord>> {
      const { title, ownerIdList, ingredientIdList, visibilityList, skip, limit } = params;
      // quick safety check to make sure this function is being used correctly (not effective authorization)
      if (visibilityList.length == 0) { throw new Error('recipes.repository received an empty visibilityList array'); }
      if (visibilityList.includes('personal') && (!ownerIdList || ownerIdList.length != 1)) { throw new Error('recipes.repository is looking for personal recipes but was not given exactly 1 ownerId'); }

      // public recipes match regardless of owner; everything else is owner-scoped
      const restrictedVisibilityList = visibilityList.filter((visibility) => visibility !== 'public');
      if (restrictedVisibilityList.length && !ownerIdList?.length) {
         throw new Error('recipes.repository is looking for non-public recipes but no ownerIds were specified');
      }

      const visibilityClauseList = [
         ...(visibilityList.includes('public') ? [{ visibility: 'public' }] : []),
         ...(restrictedVisibilityList.length
            ? [{ visibility: { $in: restrictedVisibilityList }, ownerId: { $in: ownerIdList } }]
            : []),
      ];

      const resultList = await RecipeModel.aggregate<{
         recordList: RecipeRecord[];
         countList: { count: number }[];
      }>([
         {
            $match: {
               ...(title && { title: { $regex: escapeRegex(title), $options: 'i' } }),
               ...(ingredientIdList?.length && { 'ingredientList._id': { $all: ingredientIdList } }),
               $or: visibilityClauseList,
            },
         },
         {
            $facet: {
               recordList: [
                  ...(skip ? [{ $skip: skip }] : []),
                  ...(limit ? [{ $limit: limit }] : []),
               ],
               countList: [{ $count: 'count' }],
            }
         }
      ]);
      const { recordList, countList } = resultList[0]!;
      return { list: recordList, count: countList[0]?.count || 0, firstItemIndex: skip ?? 0 };
   }

   async updateRecipe(recipe: RecipeType): Promise<RecipeRecord | null> {
      const updatedRecipe = await RecipeModel.findByIdAndUpdate(
         recipe._id,
         toStoredRecipe(recipe),
         { runValidators: true }
      );
      return updatedRecipe?.toObject() ?? null;
   }
}