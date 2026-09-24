"use client"

import styles from './ingredientSearch.module.scss';
import { useState } from "react";
import { IngredientType } from "../domain/ingredient.types";
import useServiceState from "@/shared/hooks/useServiceState";
import { InputText } from "@/shared/components/Input.components";
import { ButtonIconList } from "@/shared/components/Button.components";
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { PaginatedListType } from "@/shared/shared.types";
import { ingredientService } from "../services/ingredient.service.client";

type ComponentProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'onSubmit'> & {
   onSubmit: (ingredient: IngredientType) => void;
}

export default function IngredientSearch({ onSubmit, className, ...rest }: ComponentProps) {
   const defaultIngredient: IngredientType = { _id: 0, description: '' }
   
   const [currentIngredient, setCurrentIngredient] = useState<IngredientType>(defaultIngredient);
   const [searchTerm, setSearchTerm] = useState('');

   const emptyIngredientOptions = { list: [], count: 0, firstItemIndex: 0 };
   const [ingredientOptions, setIngredientOptions] = useState<PaginatedListType<IngredientType>>(emptyIngredientOptions);

   // * Fetches a list of possible ingredients matching the string provided by { searchTerm }
   const ingredientOptionsState = useServiceState(async() => {
      let response: PaginatedListType<IngredientType>;
      // ? Don't send a fetch request if { searchTerm } is less than 3 character long
      if (searchTerm.length < 3) { response = emptyIngredientOptions; } 
      else { response = await ingredientService.search({ description: searchTerm }) }
      setIngredientOptions(response); // ? set { ingredientOptions } here so a observer function isn't necessary
      return response;
   }, [searchTerm]);

   // * set { currentIngredient } to the user selected ingredient
   function selectIngredient(ingredient: IngredientType) {
      setSearchTerm('');
      setCurrentIngredient(ingredient);
      setIngredientOptions(emptyIngredientOptions)
   }

   // * pass { currentIngredient } to { onSubmit() }, and reset the component
   // * if { currentIngredient } is null, grab the top ingredient form { ingredientOptions }
   async function handleSubmit() {
      if (currentIngredient._id !== 0) {
         onSubmit(currentIngredient);
         setCurrentIngredient(defaultIngredient);
      }

      const promise = ingredientOptionsState.waitForLoad();
      setSearchTerm(''); // ? once promise has been grabbed let the user start entering a new ingredient while the app pulls this one
      const ingredients = await promise;
      if (ingredients.status !== 'ready') { throw new Error('could not grab ingredient'); }
      if (ingredients.data.count == 0) { return; }
      onSubmit(ingredients.data.list[0]); // ? submit the first item in the list returned
   }

   // * check if the key entered was an enter key --> { pass to handleSubmit() }
   async function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.key === "Enter") { handleSubmit() }
   }

   return (
      <div className={ [styles.wrapper, className].filter(Boolean).join(" ") }>

         <div className={styles.searchBar }>

            <InputText 
               label="Search Ingredient" 
               value={ searchTerm } 
               onChange={ (event) => setSearchTerm(event.target.value) } 
               onKeyDown={ handleKeyDown } // ? Clicking enter will grab the current top ingredient in the list and submit it
               { ...rest } 
            />

            { // ? hovering list --> exists when { ingredientOptions } isn't empty
               ingredientOptions.count > 0 ? (
                  <ul className={ styles.searchList }>
                     { ingredientOptions.list.map((ingredient, index) => (
                        <li 
                           key={index} 
                           onClick={ () => selectIngredient(ingredient) }
                        > 
                           { ingredient.commonName ? ingredient.commonName : ingredient.description } 
                        </li>
                     ))}
                  </ul>
               ) : null }
         </div>

         <div className={ styles.submitButtonWrapper }>
            <ButtonIconList iconList={ [{ icon: faCircleCheck, label: 'Add Ingredient to List',  onClick: () => handleSubmit() }] } />
         </div>

      </div>
   )
}