import Elysia, { status, t } from "elysia";
import { authenticateMiddleware, authorizeMiddleware } from "../../auth/auth.middleware";
import { recipesService } from "../../../container";
import { ValidatorCommonMongooseId } from "../../../common/domain/validators/mongooseId.validator";
import { ValidatorCommonRecipe, ValidatorCommonRecipeDraft } from "../domain/validators/recipe.validator";
import { ValidatorIncomingRecipesSearchBody } from "./validators/search.validator";
import { ValidatorCommonPaginatedList } from "../../../common/domain/validators/pagination.validator";

const service = recipesService;

export const recipesController = new Elysia({ prefix: '/recipes' })



   //* Routes past this point use but do not require an accessToken
   .use(authenticateMiddleware)



   .get( '/get/:_id',
      async ({ authId, params }) => {
         const { _id } = params;
         const recipe = await service.get(_id, { authId });
         return status(200, recipe);
      },
      {
         params: t.Object({ _id: ValidatorCommonMongooseId }),
         response: ValidatorCommonRecipe,
      }
   )



   .get( '/search', 
      async ({ authId, query }) => {
         const { title, ownerIdList, ingredientIdList, visibilityList, limit, skip } = query;
         const recipes = await service.search({ authId, title, ownerIdList, ingredientIdList, visibilityList, skip, limit });
         return status(200, recipes)
      },
      {
         query: ValidatorIncomingRecipesSearchBody,
         response: ValidatorCommonPaginatedList(ValidatorCommonRecipe),
      }
   )



   //* Routes past this point require an access token
   .use(authorizeMiddleware)



   .post( '/create',
      async ({ authId, body }) => {
         const recipe = await service.create(body, { authId })
         return status(201, recipe);
      },
      {
         body: ValidatorCommonRecipeDraft,
         response: { 201: ValidatorCommonRecipe }
      }
   )



   .put( '/update/:_id',
      async ({ authId, body, params }) => {
         const { _id } = params;
         const updatedRecipe = await service.update(_id, body, { authId });
         return status(201, updatedRecipe);
      },
      {
         params: t.Object({ _id: ValidatorCommonMongooseId }),
         body: t.Partial(ValidatorCommonRecipeDraft),
         response: { 201: ValidatorCommonRecipe }
      }
   )