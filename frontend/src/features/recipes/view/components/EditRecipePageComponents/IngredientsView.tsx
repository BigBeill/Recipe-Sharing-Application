"use client"

import { IngredientType } from "@/features/ingredients/domain/ingredient.types";
import IngredientSearch from "@/features/ingredients/view/components/IngredientSearch.component";
import { DataHandle } from "@/shared/domain/shared.types";
import { useInteractableList } from "@/shared/lib/hooks/useInteractableList";
import { NotebookComponentDefault } from "@/shared/view/components/notebookPageSpecific/default.notebookComponent";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Ref } from "react";

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

   return (
      <NotebookComponentDefault style={ { display: 'flex', flexDirection: 'column' } }>
         <h2>Recipe Ingredients</h2>
         { ingredientList.htmlView }
         <IngredientSearch onSubmit={ (ingredient: IngredientType) => ingredientList.addItem(ingredient) } extendedRequirements={ true }/>
      </NotebookComponentDefault>
   )
}
