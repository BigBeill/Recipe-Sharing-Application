import Elysia from "elysia";
import { authenticateMiddleware, authorizeMiddleware } from "../auth/auth.middleware";
import { IdValidator } from "../../common/validators/id.validator";
import { recipesService } from "../../container";
import { SearchValidator } from "./validators/search.validator";
import { AddRecipeValidator } from "./validators/addRecipe.Validator";
import { RecipeValidator } from "./validators/recipe.validator";

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
         const { recipe } = body;
         const newRecipe = await service.createRecipe(recipe, { authId })
         return { data: newRecipe }
      },
      {
         body: AddRecipeValidator
      }
   )



   .put( '/update',
      async ({ authId, body }) => {
         const { recipe } = body;
         const updatedRecipe = await service.updateRecipe(recipe, { authId })
         return { data: updatedRecipe }
      },
      {
         body: RecipeValidator
      }
   )