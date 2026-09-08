import IngredientSearch from "@/features/ingredients/components/IngredientSearch";
import { IngredientConversionType, IngredientType } from "@/features/ingredients/domain/ingredient.types";
import { ingredientService } from "@/features/ingredients/services/ingredient.service";
import { ButtonOval } from "@/shared/components/Button.components";
import { NotebookPage } from "@/shared/components/Notebook";
import { useInteractableList } from "@/shared/hooks/useInteractableList";
import useServiceState from "@/shared/hooks/useServiceState";
import { DataHandle } from "@/shared/shared.types";
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
      <NotebookPage>
         <h2>Recipe Ingredients</h2>
         
         { ingredientList.htmlView }

         <div>
            <input type='text' placeholder='Ingredient Label (optional)' value={newIngredient.label} onChange={(event) => setNewIngredient({...newIngredient, label: event.target.value})}/>
            <input 
               type='number'  
               placeholder='Amount' 
               value={newIngredient.portion!.amount} 
               onChange={ (event) => setNewIngredient((previous) => ({ ...previous, portion: { ...previous.portion, amount: Number(event.target.value) } })) }
            />
            <select 
               value={newIngredient.portion?.description} 
               onChange={ (event) => setNewIngredient((previous) => ({ ...previous, portion: { ...previous.portion, measure_id: Number(event.target.options[event.target.selectedIndex].id), description: event.target.value } })) } 
            >
               <option value="" disabled hidden className='light'>Units</option>
               { conversionListState.status === 'ready' && conversionListState.data.map((conversionFactor, index) => (
                  <option key={index} id={ String(conversionFactor.measure_id) }>{conversionFactor.measure_description}</option>
               )) }
            </select>
         </div>

         <IngredientSearch onSubmit={ (ingredient: IngredientType) => ingredientList.addItem(ingredient) }/>

         <ButtonOval onClick={ () => addIngredient } >
            Add Ingredient
         </ButtonOval>

         <button className="darkText additionalMargin" onClick={() => addIngredient()}>Add Ingredient</button>

      </NotebookPage>
   )
}
