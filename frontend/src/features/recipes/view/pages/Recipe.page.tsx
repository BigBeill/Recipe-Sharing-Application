"use client"

import styles from './styles/recipe.module.scss';
import { RecipeType } from "../../domain/recipes.types";
import ImageDisplay from "@/features/images/components/ImageDisplay";
import { ComponentPropsWithoutRef, Ref, useRef } from "react";
import { DataHandle } from '@/shared/domain/shared.types';
import BasicPage from '@/shared/view/pages/Basic.page';
import NotebookPage from '@/shared/view/pages/Notebook.page';
import { NotebookComponentDefault } from '@/shared/view/components/notebookPageSpecific/default.notebookComponent';
import { FullscreenPage } from '@/shared/view/pages/Fullscreen.page';
import NutritionList from '@/features/ingredients/view/components/NutritionList.component';

interface Props {
   recipe: RecipeType;
}

export default function RecipePage ({ recipe }: Props) {

   const fullscreenRef = useRef<DataHandle<boolean>>(null);

   return (
      <>
         <NotebookPage components={ { 
            list: [
               <TitleView recipe={ recipe }/>, 
               <InstructionView recipe={ recipe } onClick={ () => fullscreenRef.current!.setData(true) } />
            ], 
            count: 2, 
            firstItemIndex: 0 
         } }/>

         <FullscreenView recipe={ recipe } ref={ fullscreenRef } />
      </>
   )
}

function TitleView({ recipe }: Props) {
   return (
      <NotebookComponentDefault>
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
      </NotebookComponentDefault>
   );
}

function InstructionView({ recipe, ...rest }: Props & ComponentPropsWithoutRef<'div'>) {

   return (
      <NotebookComponentDefault { ...rest }>
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
      </NotebookComponentDefault>
   )
}

function FullscreenView({ recipe, ref }: Props & { ref: Ref<DataHandle<boolean>> }) {
   return (
      <FullscreenPage ref={ ref } >
         <BasicPage>
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
         </BasicPage>
      </FullscreenPage>
   );
}