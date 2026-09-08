"use client"

import styles from './recipePage.module.scss';
import { RecipeType } from "../domain/recipes.types";
import ImageDisplay from "@/features/images/components/ImageDisplay";
import { ComponentPropsWithoutRef, Ref, useImperativeHandle, useRef, useState } from "react";
import Notebook, { NotebookPage } from "@/shared/components/Notebook";
import { Fullscreen } from "@/shared/components/Fullscreen";
import NutritionList from '@/features/ingredients/components/NutritionList';
import { DataHandle } from '@/shared/shared.types';

interface Props {
   recipe: RecipeType;
}

export default function RecipePage ({ recipe }: Props) {

   const fullscreenRef = useRef<DataHandle<boolean>>(null);

   return (
      <>
         <Notebook components={ { list: [<TitleView recipe={ recipe }/>, <InstructionView recipe={ recipe } onClick={ () => fullscreenRef.current!.setData(true) } />], count: 2, firstItemIndex: 0 } }/>

         <FullscreenView recipe={ recipe } ref={ fullscreenRef } />
      </>
   )
}

function TitleView({ recipe }: Props) {
   return (
      <NotebookPage>
         <div className={ styles.wrapper } >
            <h2 className={ styles.heading2 }>{ recipe.title }</h2>

            <div className={ styles.shareSpace }>
               <ImageDisplay packagedImage={ recipe.image } className={ styles.photo } />
               <NutritionList nutrition={ recipe.nutrition } />
            </div>

            <div className="description">
               <h3>Description</h3>
               <p>{ recipe.description }</p>
            </div>
         </div>
      </NotebookPage>
   );
}

function InstructionView({ recipe, ...rest }: Props & ComponentPropsWithoutRef<'div'>) {

   return (
      <NotebookPage { ...rest }>
         <div className={ styles.wrapper } >
            <h2>How To Make</h2>
            <h3>Ingredients</h3>
            <ul className={ styles.list }>
               { recipe.ingredientList.map((ingredient, index) => (
                  <li key={ index }>
                     { ingredient.label ? 
                        `${ ingredient.label }` 
                     : 
                        `${ ingredient.portion?.amount } ${ ingredient.portion?.description} of ${ ingredient.description }` 
                     }
                  </li>
               )) }
            </ul>
            <h3>Instructions</h3>
            <ol className={ styles.list }>
               { recipe.instructionList.map((instruction, index) => (
                  <li key={ index }>
                     <h4>Step { index + 1}</h4>
                     <p>{ instruction }</p>
                  </li>
               )) }
            </ol>
         </div>
      </NotebookPage>
   )
}

function FullscreenView({ recipe, ref }: Props & { ref: Ref<DataHandle<boolean>> }) {

   return (
      <Fullscreen ref={ ref } >
         <h1>{ recipe.title }</h1>
         <ul >
            { recipe.ingredientList.map((ingredient, index) => (
               <li key={ index }>{ ingredient.portion?.amount } { ingredient.portion?.description} of { ingredient.description }</li>
            )) }
         </ul>
         <h3>Instructions</h3>
         <ol>
            { recipe.instructionList.map((instruction, index) => (
               <li key={ index }>
                  <h4>Step { index + 1}</h4>
                  <p>{ instruction }</p>
               </li>
            ))}
         </ol>
      </Fullscreen>
   );
}