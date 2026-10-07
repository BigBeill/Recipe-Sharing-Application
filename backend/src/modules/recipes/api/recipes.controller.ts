import Elysia from "elysia";
import { authenticateMiddleware, authorizeMiddleware } from "../../auth/auth.middleware";
import { IdValidator } from "../../../common/validators/id.validator";
import { recipesService } from "../../../container";
import { SearchValidator } from "../domain/validators/search.validator";
import { ValidatorRecipeDraft } from "../domain/validators/recipeDraft.Validator";

const service = recipesService;

export const recipesController = new Elysia({ prefix: '/recipes' })



   //* Routes past this point use but do not require an accessToken
   .use(authenticateMiddleware)



   .get( '/get/:_id',
      async ({ authId, params }) => {
         const { _id } = params;
         const recipe = await service.getRecipe(_id, { authId });
         return { data: recipe };
      },
      {
         params: IdValidator
      }
   )



   .get( '/search', 
      async ({ authId, query }) => {
         const { title, ownerIdList, ingredientIdList, visibilityList, limit, skip } = query;
         const recipes = await service.searchRecipes({ authId, title, ownerIdList, ingredientIdList, visibilityList, skip, limit });
         return { data: recipes };
      },
      {
         query: SearchValidator
      }
   )



   //* Routes past this point require an access token
   .use(authorizeMiddleware)



   .post( '/create',
      async ({ authId, body }) => {
         const newRecipe = await service.createRecipe(body, { authId })
         return { data: newRecipe }
      },
      {
         body: ValidatorRecipeDraft
      }
   )



   .put( '/update/:_id',
      async ({ authId, body, params }) => {
         const { _id } = params;
         const updatedRecipe = await service.updateRecipe(_id, body, { authId })
         return { data: updatedRecipe }
      },
      {
         params: IdValidator,
         body: ValidatorRecipeDraft
      }
   )