"use client"

import { useState } from "react";
import { IngredientType } from "../domain/ingredient.types";
import useServiceState from "@/shared/hooks/useServiceState";
import { InputText } from "@/shared/components/Input.components";
import { ButtonIconList } from "@/shared/components/Button.components";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { PaginatedListType } from "@/shared/shared.types";
import { ingredientService } from "../services/ingredient.service.client";

interface ComponentProps {
   onSubmit: (ingredient: IngredientType) => void
}

export default function IngredientSearch({ onSubmit }: ComponentProps) {

   const defaultIngredient: IngredientType = { _id: 0, description: '' }
   
   const [currentIngredient, setCurrentIngredient] = useState<IngredientType>(defaultIngredient);
   const [searchTerm, setSearchTerm] = useState('');

   // search for ingredients based on what is held in the search term
   const searchResultsState = useServiceState(() => {
      if (searchTerm.length >= 3) { return ingredientService.search({ description: searchTerm }) }
      else { return Promise.resolve({ list: [], count: 0, firstItemIndex: 0 }); }
   }, [searchTerm]);

   const searchResults: PaginatedListType<IngredientType> = searchResultsState.status === 'ready' ? searchResultsState.data : { list: [], count: 0, firstItemIndex: 0 };

   function selectIngredient(ingredient: IngredientType) {
      setSearchTerm('');
      setCurrentIngredient(ingredient);
   }

   function handleSubmit() {
      if (currentIngredient._id !== 0) {
         onSubmit(currentIngredient);
         setCurrentIngredient(defaultIngredient);
      }
   }

   return (
      <div>
         <div>
            <InputText label="Search Ingredient" onChange={ (event) => setSearchTerm(event.target.value) }/>
            <ul className={`${ searchResults.count === 0 ? 'hidden' : '' }`}>
               { searchResults.list.map((ingredient, index) => (
                  <li key={index} onClick={ () => selectIngredient(ingredient) }> { ingredient.commonName ? ingredient.commonName : ingredient.description } </li>
               ))}
            </ul>
         </div>
         <div className='svgButtonContainer'>
            <ButtonIconList iconList={ [{ icon: faCircleCheck, label: 'Add Ingredient to List',  onClick: () => handleSubmit() }] } />
         </div>
      </div>
   )
}