import "client-only";

import { createIngredientService } from "./ingredient.service";
import { createIngredientApi } from "./ingredient.api";
import callApiClient from "@/shared/lib/api/callApi.client";

export const ingredientService = createIngredientService(createIngredientApi(callApiClient));