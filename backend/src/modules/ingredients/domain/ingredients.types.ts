export interface TypeIngredient {
   _id: number;
   description: string;
   label?: string;
   commonName?: string;
}

export interface TypeIngredientConversion {
   food_id: number
   measure_id: number,
   measure_description: string,
   value: number
}

export interface TypeIngredientGroup {
   _id: number;
   description: string;
}

export type TypeRecipeIngredient = TypeIngredient & {
   portion: {
      _id: number;
      description: string;
      amount: number;
   }
}