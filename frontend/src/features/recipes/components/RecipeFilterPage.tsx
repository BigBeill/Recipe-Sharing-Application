"use client"

import IngredientSearch from "@/features/ingredients/components/IngredientSearch";
import { IngredientType } from "@/features/ingredients/domain/ingredient.types";
import { ingredientService } from "@/features/ingredients/services/ingredient.service.client";
import { ButtonOval } from "@/shared/components/Button.components";
import { InputText } from "@/shared/components/Input.components";
import { NotebookPage } from "@/shared/components/Notebook";
import { useInteractableList } from "@/shared/hooks/useInteractableList";
import useServiceState from "@/shared/hooks/useServiceState";
import { DataHandle } from "@/shared/shared.types";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef } from "react";

export default function RecipeFilterPage() {

   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();
   const title = searchParams.get('title') || '';
   const ingredients = searchParams.get('ingredients');
   const ingredientIdList = useMemo(() => { return ingredients ? ingredients.split(',').map(Number) : [] }, [ingredients] );
   const category = searchParams.get('category');

   const titleRef = useRef<DataHandle<string>>(null);
   const ingredientListRef = useRef<DataHandle<IngredientType[]>>(null);
   const categoryRef = useRef<DataHandle<"public" | "friends" | "personal">>(null);

   const ingredientList = useInteractableList({
      initial: [],
      ref: ingredientListRef,
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

   useServiceState(async () => {
      // get ingredientList without any removed ingredients
      const urlIds = new Set(ingredientIdList);
      const prunedIngredientList = ingredientListRef.current!.getData().filter((ingredient) => urlIds.has(ingredient._id));

      // get ingredientIdList without any already known ingredients
      const currentIds = new Set(ingredientListRef.current!.getData().map((ingredient) => ingredient._id));
      const newIdList = ingredientIdList.filter((id) => !currentIds.has(id));

      // fetch all new ingredients from the server
      const newIngredientList = await Promise.all(
         newIdList.map((id) => {
            return ingredientService.get(id); 
         })
      );

      ingredientListRef.current!.setData([...prunedIngredientList, ...newIngredientList]);
   }, [ingredientIdList]);

   function handleFormSubmit() {
      const updatedParams = new URLSearchParams()
      const title = titleRef.current!.getData()
      const ingredientList = ingredientListRef.current!.getData();
      if(title) { updatedParams.set('title', title); }
      if(ingredientList.length !== 0) { updatedParams.set('ingredientIdList', ingredientList.map((ingredient) => ingredient._id).join(',')); }
      router.push(`${pathname}?${updatedParams}`);
   }

   return (
      <NotebookPage>
         <h1>Public Recipes</h1>

         <InputText label='Name' value={ title } dataRef={ titleRef } placeholder='recipe name' />
         <IngredientSearch onSubmit={ ingredientList.addItem } />

         <ButtonOval onClick={ handleFormSubmit }>search</ButtonOval>
      </NotebookPage>
   );
}