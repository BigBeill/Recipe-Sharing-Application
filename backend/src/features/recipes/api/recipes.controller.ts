import Elysia, { status } from "elysia";
import { authenticateMiddleware, authorizeMiddleware } from "../../auth/auth.middleware";
import { IdParamsValidator } from "../../../common/api/validators/id.validator";
import { recipesService } from "../../../container";
import { SearchValidator } from "./validators/search.validator";
import { DepartingRecipeValidator } from "../../../global/departingData/validators/departingRecipe.validator";
import { DepartingPaginatedList } from "../../../global/departingData/validators/departingPaginatedList";
import { RecipeDraftValidator } from "./validators/recipeDraft.Validator";
import { ValidatorRecipesUpdate } from "./validators/update.validator";

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
         params: IdParamsValidator,
         response: DepartingRecipeValidator,
      }
   )



   .get( '/search', 
      async ({ authId, query }) => {
         const { title, ownerIdList, ingredientIdList, visibilityList, limit, skip } = query;
         const recipes = await service.search({ authId, title, ownerIdList, ingredientIdList, visibilityList, skip, limit });
         return status(200, recipes)
      },
      {
         query: SearchValidator,
         response: DepartingPaginatedList(DepartingRecipeValidator),
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
         body: RecipeDraftValidator,
         response: { 201: DepartingRecipeValidator }
      }
   )



   .put( '/update/:_id',
      async ({ authId, body, params }) => {
         const { _id } = params;
         const updatedRecipe = await service.update(_id, body, { authId });
         return status(201, updatedRecipe);
      },
      {
         params: IdParamsValidator,
         body: ValidatorRecipesUpdate,
         response: { 201: DepartingRecipeValidator }
      }
   )