"use client"

import { IngredientConversionType, IngredientType } from "@/features/ingredients/domain/ingredient.types";
import { ingredientService } from "@/features/ingredients/services/ingredient.service.client";
import IngredientSearch from "@/features/ingredients/view/components/IngredientSearch.component";
import { DataHandle } from "@/shared/domain/shared.types";
import { useInteractableList } from "@/shared/lib/hooks/useInteractableList";
import useServiceState from "@/shared/lib/hooks/useServiceState";
import { ButtonOval } from "@/shared/view/components/Button.components";
import { NotebookComponentDefault } from "@/shared/view/components/notebookPageSpecific/default.notebookComponent";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Ref, useState } from "react";

// just ingredient type but portion is forced
type NewIngredientType = Omit<IngredientType, 'portion'> & {
  portion: NonNullable<IngredientType['portion']>;
};

interface ComponentProps {
   refs: {
      ingredientList: Ref<DataHandle<IngredientType[]>>
   }
   initial: {
      ingredientList: IngredientType[];
   }
}

export default function EditRecipeIngredientsView ({ refs, initial}: ComponentProps) {

   const ingredientList = useInteractableList({
      initial: initial.ingredientList,
      ref: refs.ingredientList,
      renderItemContent: (item: IngredientType) => {
         if (item.commonName) { return (<p>{ item.commonName }</p>) }
         else if (item.portion) { return (<p>{ item.portion.amount } { item.portion.description } of [{ item.description }]</p>)  }
         else { return (<p>[{ item.description }]</p>) }
      },
      renderItemOptions: (item: IngredientType, index: number) => (
         <FontAwesomeIcon
            role='button'
            tabIndex={0}
            aria-label={`Remove ingredient ${index + 1}`}
            icon={faCircleXmark}
            style={{color: "#575757",}}
            onClick={() => ingredientList.removeIndex(index)} 
         />
      ), 
   });
   
   const [newIngredient, setNewIngredient] = useState<NewIngredientType>({ _id: 0, description: '', label: '', commonName: '', portion: { _id: 0, description: '', amount: 0 } });

   const conversionListState = useServiceState<IngredientConversionType[]>(() => { 
      if (newIngredient._id !== 0) { return ingredientService.conversionOptionList(newIngredient._id); }
      else { return Promise.resolve([{ food_id: 0, measure_id: 1489, measure_description: 'g', value: 1 }]); }
   }, [newIngredient._id])

   function addIngredient() {
      ingredientList.addItem(newIngredient);
      setNewIngredient({ _id: 0, description: '', label: '', commonName: '', portion: { _id: 0, description: '', amount: 0 } })
   }

   return (
      <NotebookComponentDefault style={ { display: 'flex', flexDirection: 'column' } }>
         <h2>Recipe Ingredients</h2>
         
         { ingredientList.htmlView }

         <IngredientSearch onSubmit={ (ingredient: IngredientType) => ingredientList.addItem(ingredient) } extendedRequirements={ true }/>

         <ButtonOval onClick={ () => addIngredient } >
            Add Ingredient
         </ButtonOval>

      </NotebookComponentDefault>
   )
}
