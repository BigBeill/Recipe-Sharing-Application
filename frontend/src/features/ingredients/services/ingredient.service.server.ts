import "server-only";

import { createIngredientService } from "./ingredient.service";
import { createIngredientApi } from "./ingredient.api";
import callApiServer from "@/shared/lib/api/callApi.server";

export const ingredientService = createIngredientService(createIngredientApi(callApiServer))