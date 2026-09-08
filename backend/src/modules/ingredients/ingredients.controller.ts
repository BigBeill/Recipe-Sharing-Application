import Elysia from "elysia";
import { ingredientsService } from "../../container";
import { SearchValidator } from "./validators/search.validator";
import { PostgresIdValidator } from "../../common/validators/postgresId.validator";
import { SearchConversionValidator } from "./validators/searchConversion.validator";
import type { PaginatedListType } from "../../common/types/return.types";
import type { IngredientGroupType } from "./ingredients.types";
import { GetValidator } from "./validators/get.validator";

const service = ingredientsService;

export const ingredientsController = new Elysia({ prefix: '/ingredients' })
   .get( '/get/:_id',
      async ({ params, query }) => {
         const { _id } = params;
         const ingredient = await service.getIngredient(_id, query);
         return {
            data: ingredient
         };
      },
      {
         params: PostgresIdValidator,
         query: GetValidator,
      }
   )
   .get( '/search',
      async ({ query }) => {
         const { description, food_group_id, skip = 0, limit = 32 } = query;
         const ingredientList = await service.searchIngredient({ description, food_group_id, skip, limit });
         return {
            data: ingredientList 
         };
      },
      {
         query: SearchValidator
      }
   )
   .get( '/searchConversion',
      async ({ query }) => {
         const { food_id, skip = 0, limit = 32  } = query;
         const conversionList = service.searchConversion(food_id, { skip, limit });
         return { 
            data: conversionList 
         };
      },
      {
         query: SearchConversionValidator,
      }
   )
   .get( '/searchGroup', 
      async () => {
         const groupList: PaginatedListType<IngredientGroupType> = await service.searchGroup({});
         return {
            data: groupList 
         };
      }
   )