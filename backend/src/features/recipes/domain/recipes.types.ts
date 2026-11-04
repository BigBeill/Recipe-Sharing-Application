import type { Types } from "mongoose";
import type { TypeImageReference } from "../../images/domain/images.types";
import type { TypeIngredient } from "../../ingredients/domain/ingredients.types";

export type TypeRecipe = {
   _id: Types.ObjectId;
   ownerId: Types.ObjectId;
   title: string;
   description: string;
   signedImageUrl?: string;
   ingredientList: TypeIngredient[];
   instructionList: string[];
   visibility: 'public' | 'private' | 'personal';
   nutrition: TypeNutrition;
}

export type TypeRecipeDraft = Omit<TypeRecipe, 
      | '_id' 
      | 'ownerId' 
      | 'signedImageUrl' 
      | 'nutrition'
   > & {
      imageReference?: TypeImageReference;
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