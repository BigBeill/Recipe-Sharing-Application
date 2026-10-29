import Elysia, { status, t } from "elysia";
import { ingredientsService } from "../../../container";
import { SearchValidator } from "./validators/search.validator";
import { PostgresIdParamsValidator } from "../../../common/api/validators/postgresId.validator";
import { GetValidator } from "./validators/get.validator";
import { PaginationValidator } from "../../../common/api/validators/pagination.validator";
import { DepartingIngredientValidator } from "../../../global/departingData/validators/departingIngredient.validator";
import { DepartingPaginatedList } from "../../../global/departingData/validators/departingPaginatedList";
import { DepartingIngredientConversionValidator } from "../../../global/departingData/validators/departingIngredientConversion.validator";
import { DepartingFoodGroupValidator } from "../../../global/departingData/validators/departingFoodGroup.validator";

const service = ingredientsService;

export const ingredientsController = new Elysia({ prefix: '/ingredients' })



   .get( '/get/:_id',
      async ({ params, query }) => {
         const { _id } = params;
         const ingredient = await service.get(_id);
         return status(200, ingredient);
      },
      {
         params: PostgresIdParamsValidator,
         query: GetValidator,
      }
   )



   .get( '/search',
      async ({ query }) => {
         const { description, food_group_id, skip = 0, limit = 32 } = query;
         const ingredients = await service.searchIngredient({ description, food_group_id, skip, limit });
         return status(200, ingredients);
      },
      {
         query: SearchValidator,
         response: DepartingPaginatedList(t.Omit(DepartingIngredientValidator, ['portion'])),
      }
   )



   .get( '/searchConversion/:_id',
      async ({ params, query }) => {
         const { _id: food_id } = params;
         const { skip = 0, limit = 32  } = query;
         const conversions = await service.searchConversion(food_id, { skip, limit });
         return status(200, conversions);
      },
      {
         params: PostgresIdParamsValidator,
         query: PaginationValidator,
         response: DepartingPaginatedList(DepartingIngredientConversionValidator)
      }
   )



   .get( '/searchGroup', 
      async () => {
         const foodGroups = await service.searchGroup({});
         return status(200, foodGroups);
      },
      {
         response: DepartingPaginatedList(DepartingFoodGroupValidator),
      }
   )