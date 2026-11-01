export interface TypeIngredientDraft {
   _id: number;
   description: string;
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

export type TypeIngredient = TypeIngredientDraft & {
   label?: string;
   portion: {
      _id: number;
      description: string;
      amount: number;
   }
}