import "client-only";
import { createRecipeService } from "./recipes.service";
import { createRecipeApi } from "./recipes.api";
import callApiClient from "@/shared/lib/api/callApi.client";

export const recipeService = createRecipeService(createRecipeApi(callApiClient));