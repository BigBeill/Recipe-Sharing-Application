import type { ImageType } from "../../images/images.types";
import type { TypeRecipeIngredient } from "../../ingredients/domain/ingredients.types";

export interface TypeRecipe extends TypeRecipeDraft {
   _id: string;
   ownerId: string;
   nutrition: TypeNutrition;
}

export interface TypeRecipeDraft {
   title: string;
   description: string;
   image?: ImageType;
   ingredientList: TypeRecipeIngredient[];
   instructionList: string[];
   visibility: 'public' | 'private' | 'personal';
}

export interface TypeNutrition {
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