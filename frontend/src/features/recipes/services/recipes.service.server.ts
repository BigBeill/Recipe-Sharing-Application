import "server-only";
import { createRecipeService } from "./recipes.service";
import { createRecipeApi } from "./recipes.api";
import callApiServer from "@/shared/lib/api/callApi.server";

export const recipeService = createRecipeService(createRecipeApi(callApiServer));