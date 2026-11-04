import { TypeImageReference } from '@/features/images/domain/image.types';
import { IngredientType, TypeNutrition } from '../../ingredients/domain/ingredient.types';

export type TypeRecipeVisibilityOptions = 'public' | 'private' | 'personal';

export type TypeRecipe = {
   _id: string;
   ownerId: string;
   title: string;
   description: string;
   signedImageUrl?: string;
   ingredientList: IngredientType[];
   instructionList: string[];
   visibility: TypeRecipeVisibilityOptions;
   nutrition: TypeNutrition
}

export type TypeRecipeDraft = 
   Omit<TypeRecipe,
      | '_id'
      | 'ownerId'
      | 'nutrition'
      | 'signedImageUrl'
   > & {
      imageReference?: TypeImageReference
   }