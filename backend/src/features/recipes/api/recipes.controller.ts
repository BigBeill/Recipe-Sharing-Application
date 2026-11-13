import Elysia, { status, t } from "elysia";
import { authenticateMiddleware } from "../../authentication/authentication.middleware";
import { ValidatorCommonMongooseId } from "../../../common/domain/validators/mongooseId.validator";
import { ValidatorCommonRecipe, ValidatorCommonRecipeDraft } from "../domain/validators/recipe.validator";
import { ValidatorIncomingRecipesSearchBody } from "./validators/search.validator";
import { ValidatorCommonPaginatedList } from "../../../common/domain/validators/pagination.validator";
import type { RecipesService } from "../application/recipes.service";
import { authorizeMiddleware } from "../../authorization/authorization.middleware";

export const recipesController = new Elysia({ prefix: '/recipes' })
   .use(authenticateMiddleware)
   .derive(({ scope }) => ({
      service: scope.resolve<RecipesService>("recipesService"),
   }))



   .get( '/get/:_id',
      async ({ service, params }) => {
         const { _id } = params;
         const recipe = await service.get(_id);
         return status(200, recipe);
      },
      {
         params: t.Object({ _id: ValidatorCommonMongooseId }),
         response: ValidatorCommonRecipe,
      }
   )



   .get( '/search', 
      async ({ service, query }) => {
         const { title, ownerIdList, ingredientIdList, visibilityList, limit, skip } = query;
         const recipes = await service.search({ title, ownerIdList, ingredientIdList, visibilityList, skip, limit });
         return status(200, recipes)
      },
      {
         query: ValidatorIncomingRecipesSearchBody,
         response: ValidatorCommonPaginatedList(ValidatorCommonRecipe),
      }
   )



   .use(authorizeMiddleware)



   .post( '/create',
      async ({ service, body }) => {
         const recipe = await service.create(body)
         return status(201, recipe);
      },
      {
         body: ValidatorCommonRecipeDraft,
         response: { 201: ValidatorCommonRecipe }
      }
   )



   .put( '/update/:_id',
      async ({ body, params, service }) => {
         const { _id } = params;
         const updatedRecipe = await service.update(_id, body);
         return status(201, updatedRecipe);
      },
      {
         params: t.Object({ _id: ValidatorCommonMongooseId }),
         body: t.Partial(ValidatorCommonRecipeDraft),
         response: { 201: ValidatorCommonRecipe }
      }
   )