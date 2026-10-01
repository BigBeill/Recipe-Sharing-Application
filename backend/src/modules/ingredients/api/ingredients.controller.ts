import Elysia from "elysia";
import { ingredientsService } from "../../../container";
import { SearchValidator } from "../domain/validators/search.validator";
import { PostgresIdValidator } from "../../../common/validators/postgresId.validator";
import { GetValidator } from "../domain/validators/get.validator";
import { PaginationValidator } from "../../../common/validators/pagination.validator";

const service = ingredientsService;

export const ingredientsController = new Elysia({ prefix: '/ingredients' })



   .get( '/get/:_id',
      async ({ params, query }) => {
         const { _id } = params;
         const ingredient = await service.getIngredient(_id);
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



   .get( '/searchConversion/:_id',
      async ({ params, query }) => {
         const { _id: food_id } = params;
         const { skip = 0, limit = 32  } = query;
         const conversionList = await service.searchConversion(food_id, { skip, limit });
         return { 
            data: conversionList 
         };
      },
      {
         params: PostgresIdValidator,
         query: PaginationValidator,
      }
   )



   .get( '/searchGroup', 
      async () => {
         const groupList = await service.searchGroup({});
         return {
            data: groupList 
         };
      }
   )