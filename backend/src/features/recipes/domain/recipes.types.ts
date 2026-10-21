import type { Types } from "mongoose";
import type { TypeImageReference } from "../../images/domain/images.types";
import type { TypeRecipeIngredient } from "../../ingredients/domain/ingredients.types";

export interface TypeRecipe extends TypeRecipeDraft {
   _id: Types.ObjectId;
   ownerId: Types.ObjectId;
   nutrition: TypeNutrition;
}

export interface TypeRecipeDraft {
   title: string;
   description: string;
   imageReference?: TypeImageReference;
   ingredientList: TypeRecipeIngredient[];
   instructionList: string[];
   visibility: 'public' | 'private' | 'personal';
}

export type TypeNutrition = {
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