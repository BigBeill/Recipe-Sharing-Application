"use client"

import { useState } from "react";
import { IngredientType } from "../domain/ingredient.types";
import BasicPage from "@/shared/components/basic/page";

export default function IngredientPage({ ingredient }: { ingredient: IngredientType }) {

   const [quantity, setQuantity] = useState<{value: number, unit: string}>({value: 100, unit: 'g'});

   return (
      <BasicPage>
         <h1>{ ingredient.description }</h1>
         <input type='number' value={ quantity.value } onChange={ (event) => setQuantity({ ...quantity, value: Number(event.target.value) }) }/>
         { ingredient.nutrition !== undefined && 
            <div>
               <p>calories: { ((ingredient.nutrition!.calories/100) * quantity.value).toFixed(0) }</p>
               <p>fat: { ((ingredient.nutrition!.fat/100) * quantity.value).toFixed(2) }g</p>
               <p>cholesterol: { ((ingredient.nutrition!.cholesterol/100) * quantity.value).toFixed(0) }mg</p>
               <p>sodium: { ((ingredient.nutrition!.sodium/100) * quantity.value).toFixed(0) }mg</p>
               <p>potassium: { ((ingredient.nutrition!.potassium/100) * quantity.value).toFixed(0) }mg</p>
               <p>carbohydrates: { ((ingredient.nutrition!.carbohydrates/100) * quantity.value).toFixed(2) }g</p>
               <p>fibre: { ((ingredient.nutrition!.fibre/100) * quantity.value).toFixed(1) }g</p>
               <p>sugar: { ((ingredient.nutrition!.sugar/100) * quantity.value).toFixed(2) }g</p>
               <p>protein: { ((ingredient.nutrition!.protein/100) * quantity.value).toFixed(2) }g</p>
            </div> 
         }
      </BasicPage>
   );
}