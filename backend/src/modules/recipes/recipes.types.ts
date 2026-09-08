import type { ImageType } from "../images/images.types";
import type { IngredientType } from "../ingredients/ingredients.types";

export interface RecipeType {
   _id: string;
   ownerId: string;
   title: string;
   description: string;
   image?: ImageType;
   ingredientList: IngredientType[];
   instructionList: string[];
   nutrition: NutritionType
   visibility: 'public' | 'private' | 'personal';
}

export interface NutritionType {
   calories: number;
   fat: number;
   cholesterol: number;
   sodium: number;
   potassium: number;
   carbohydrates: number;
   fibre: number;
   sugar: number;
   protein: number;
}