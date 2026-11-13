import Elysia, { status, t } from "elysia";
import { ValidatorIncomingIngredientsGetBody } from "./validators/get.validator";
import { ValidatorCommonPostgresId } from "../../../common/domain/validators/postgresId.validator";
import { ValidatorIncomingIngredientsSearchBody } from "./validators/search.validator";
import { ValidatorCommonPaginatedList } from "../../../common/domain/validators/pagination.validator";
import { ValidatorIncomingIngredientsSearchConversionBody } from "./validators/searchConversion.validator";
import { ValidatorCommonIngredientConversion } from "../domain/validators/ingredientConversion.validator";
import { ValidatorCommonFoodGroup } from "../domain/validators/foodGroup.validator";
import { ValidatorCommonIngredientDraft } from "../domain/validators/ingredient.validator";
import { authenticateMiddleware } from "../../authentication/authentication.middleware";
import type { IngredientsService } from "../application/ingredients.service";

export const ingredientsController = new Elysia({ prefix: '/ingredients' })
   .use(authenticateMiddleware)
   .derive(({ scope }) => ({
      service: scope.resolve<IngredientsService>('ingredientsService'),
   }))



   .get( '/get/:_id',
      async ({ params, service }) => {
         const { _id } = params;
         const ingredient = await service.get(_id);
         return status(200, ingredient);
      },
      {
         params: t.Object({ _id: ValidatorCommonPostgresId }),
         query: ValidatorIncomingIngredientsGetBody,
      }
   )



   .get( '/search',
      async ({ query, service }) => {
         const { description, food_group_id, skip = 0, limit = 32 } = query;
         const ingredients = await service.searchIngredient({ description, food_group_id, skip, limit });
         return status(200, ingredients);
      },
      {
         query: ValidatorIncomingIngredientsSearchBody,
         response: ValidatorCommonPaginatedList(ValidatorCommonIngredientDraft),
      }
   )



   .get( '/searchConversion/:_id',
      async ({ params, query, service }) => {
         const { _id: food_id } = params;
         const { skip = 0, limit = 32  } = query;
         const conversions = await service.searchConversion(food_id, { skip, limit });
         return status(200, conversions);
      },
      {
         params: t.Object({ _id: ValidatorCommonPostgresId }),
         query: ValidatorIncomingIngredientsSearchConversionBody,
         response: ValidatorCommonPaginatedList(ValidatorCommonIngredientConversion),
      }
   )



   .get( '/searchGroup', 
      async ({ service }) => {
         const foodGroups = await service.searchGroup({});
         return status(200, foodGroups);
      },
      {
         response: ValidatorCommonPaginatedList(ValidatorCommonFoodGroup),
      }
   )