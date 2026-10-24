import { TypeImageReference } from '@/features/images/domain/image.types';
import { IngredientType, TypeNutrition } from '../../ingredients/domain/ingredient.types';

export interface TypeRecipeDraft {
   title: string;
   description: string;
   imageReference?: TypeImageReference;
   ingredientList: IngredientType[];
   instructionList: string[];
   visibility: 'public' | 'private' | 'personal';
}

export interface TypeRecipe extends TypeRecipeDraft{
   _id: string;
   ownerId: string;
   nutrition?: TypeNutrition
}