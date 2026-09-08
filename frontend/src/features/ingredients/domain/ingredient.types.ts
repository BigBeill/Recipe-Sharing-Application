export interface IngredientType {
   _id: number;
   description: string;
   label?: string;
   commonName?: string;
   portion?: {
      _id: number;
      description: string;
      amount: number;
   }
   nutrition?: TypeNutrition
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

export interface IngredientConversionType {
   food_id: number,
   measure_id: number,
   measure_description: string,
   value: number
}

export interface IngredientGroupType {
   _id: string;
   description: string;
}