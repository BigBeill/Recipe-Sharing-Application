"use client"

import styles from './styles/ingredientSearch.module.scss';
import { useEffect, useRef, useState } from "react";
import { InputChooseValue, InputNumber, InputString } from "@/shared/view/components/Input.components";
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { DataHandle, PaginatedListType } from "@/shared/domain/shared.types";
import useServiceState from '@/shared/lib/hooks/useServiceState';
import { ButtonIconList } from '@/shared/view/components/Button.components';
import { IngredientConversionType, IngredientType } from '../../domain/ingredient.types';
import { ingredientService } from '../../services/ingredient.service.client';
import harvestRefsObject from '@/shared/lib/harvestRefsObject';

type ComponentProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'onSubmit' | 'type'> & {
   extendedRequirements?: boolean
   onSubmit: (ingredient: IngredientType) => void;
}

export default function IngredientSearch({ extendedRequirements = false, onSubmit, className, ...rest }: ComponentProps) {
   const [searchTerm, setSearchTerm] = useState('');

   // Used if { extendedRequirements } is true
   const [ingredient, setIngredient] = useState<IngredientType | null>(null);
   const [conversionOptions, setConversionOptions] = useState<PaginatedListType<IngredientConversionType>>({ list: [], count: 0, firstItemIndex: 0 });
   const refs = {
      label: useRef<DataHandle<string>>(null),
      amount: useRef<DataHandle<number>>(null),
      unit: useRef<DataHandle<IngredientConversionType | undefined>>(null),
   }

   const emptyIngredientOptions = { list: [], count: 0, firstItemIndex: 0 };
   const [ingredientOptions, setIngredientOptions] = useState<PaginatedListType<IngredientType>>(emptyIngredientOptions);

   // * Fetches a list of ingredient containing words in { searchTerm } --> on response sets { setIngredientOptions }
   const ingredientOptionsState = useServiceState(async() => {
      let response: PaginatedListType<IngredientType>;

      if (searchTerm.length < 3 || ingredient !== null) { response = emptyIngredientOptions; }  // ? Don't send a fetch request if { searchTerm } is less than 3 character long
      else { response = await ingredientService.search({ description: searchTerm }) }

      setIngredientOptions(response);
      return response;
   }, [searchTerm]);

   // * if { extendedRequirements == false } call { onSubmit } and reset the input
   // * else save the selected ingredient using { setIngredient } 
   function handleOptionSelect(ingredient: IngredientType) {
      setIngredientOptions(emptyIngredientOptions);

      if (!extendedRequirements) { 
         setSearchTerm('');
         onSubmit(ingredient);
      }
      else {
         setSearchTerm(ingredient.commonName ?? ingredient.description);
         setIngredient({ ...ingredient, portion: { _id: 1455, description: 'g', amount: 0 } });
      }
   }

   // * Grab current instance of { ingredientsOptionsState } and return the option at index 0
   async function forceSubmit() {
      const promise = ingredientOptionsState.waitForLoad();
      setSearchTerm(''); // ? once promise has been grabbed let the user start entering a new ingredient while the app pulls this one
      const ingredients = await promise;
      if (ingredients.status !== 'ready') { throw new Error('could not grab ingredient'); }
      if (ingredients.data.count == 0) { return; }
      onSubmit(ingredients.data.list[0]); // ? submit the first item in the list returned
   }

   async function handleSubmit() {
      if (!extendedRequirements) { forceSubmit(); }
      else if (ingredient) { 
         const harvestedData = harvestRefsObject(refs);
         if(!harvestedData.amount || !harvestedData.unit) { return; }
         onSubmit({ 
            ...ingredient,
            label: harvestedData.label,
            portion: {
               _id: harvestedData.unit.measure_id,
               description: harvestedData.unit.measure_description,
               amount: harvestedData.amount,
            } 
         });
         setIngredient(null);
         setSearchTerm('');
      }
      else {
         const ingredientsState = await ingredientOptionsState.waitForLoad();
         if (ingredientsState.status === 'ready') { handleOptionSelect(ingredientsState.data.list[0]); }
      }
   }

   // * check if the key entered was an enter key --> { pass to handleSubmit() }
   function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.key === "Enter") { handleSubmit(); }
   }

   // *  Call { setConversionOptionList } --> when { ingredient } is defined
   useServiceState(async () => {
      if (!ingredient) { setConversionOptions({ list: [], count: 0, firstItemIndex: 0 }) }
      else { setConversionOptions(await ingredientService.searchConversion(ingredient._id)); }
   }, [ingredient]);

   function handleChange(value: string) {
      setSearchTerm(value);
      setIngredient(null);
   }

   return (
      <div className={ [styles.wrapper, className].filter(Boolean).join(" ") }>

         { // ? hovering list --> exists when { ingredientOptions } isn't empty
            ingredientOptions.count > 0 ? (
               <ul className={ styles.searchList }>
                  { ingredientOptions.list.toReversed().map((ingredient, index) => (
                     <li
                        key={index}
                        onClick={ () => handleOptionSelect(ingredient) }
                     >
                        { ingredient.commonName ? ingredient.commonName : ingredient.description }
                     </li>
                  ))}
               </ul>
            ) : null
         }

         <div className={ [styles.supportingInputs, ...(!ingredient ? [styles.hidden] : [])].filter(Boolean).join(' ') } >
            <InputString type="text" ref={ refs.label } label='Label' placeholder='(Optional)' className={ styles.primary } />
            <InputNumber ref={ refs.amount } label='amount' />
            <InputChooseValue type='select' ref={ refs.unit } label='Units' optionList={ conversionOptions.list.map((option) => { return { label: option.measure_description, value: option } }) } />
         </div>

         <InputString
            type="text"
            label="Search Ingredient" 
            value={ searchTerm }
            placeholder='Describe your ingredient'
            onChange={ (event) => handleChange(event.target.value) } 
            onKeyDown={ handleKeyDown } // ? Clicking enter will grab the current top ingredient in the list and submit it
            className={ styles.mainInput }
            { ...rest }
         />

         <div className={ styles.submitButtonWrapper }>
            <ButtonIconList iconList={ [{ icon: faCircleCheck, label: 'Add Ingredient to List',  onClick: () => handleSubmit() }] } />
         </div>

      </div>
   )
}