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
import { ButtonOval, ButtonShielded } from '@/shared/view/components/Button.components';
import { recipeService } from '../../services/recipes.service.client';
import { useServiceMutation } from '@/shared/lib/hooks/useServiceMutation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/providers/AuthProvider';

interface Props {
   recipe: RecipeType;
}

export default function RecipePage ({ recipe }: Props) {

   const fullscreenRef = useRef<DataHandle<boolean>>(null);

   return (
      <>
         <NotebookPage components={ { 
            list: [
               <TitleShard recipe={ recipe }/>, 
               <InstructionShard recipe={ recipe } onClick={ () => fullscreenRef.current!.setData(true) } />
            ], 
            count: 2, 
            firstItemIndex: 0 
         } }/>

         <FullscreenView recipe={ recipe } ref={ fullscreenRef } />
      </>
   )
}

function TitleShard({ recipe }: Props) {
   const { session } = useAuth();
   const router = useRouter();

   const deleteMutator = useServiceMutation(async () => {
      await recipeService.delete(recipe._id);
      router.replace('recipes');
   });

   function handleEdit() {
      router.push(`/recipes/${recipe._id}/edit`);
   }

   return (
      <NotebookComponentDefault className={ styles.shardWrapper }>
         <h2 className={ styles.heading2 }>{ recipe.title }</h2>

         <div className={ styles.imageWrapper }>
            <ImageDisplay packagedImage={ recipe.image } className={ styles.photo } />
            <NutritionList nutrition={ recipe.nutrition } />
         </div>

         <div className={ styles.descriptionWrapper }>
            <h3>Description</h3>
            <p>{ recipe.description }</p>
         </div>
         <div className={ [styles.buttonWrapper, ...(session?.userId === recipe.ownerId ? [] : [styles.hidden])].filter(Boolean).join(' ') }>
            <ButtonShielded message='DeleteRecipe' onClick={ deleteMutator.send }/>
            <ButtonOval onClick={ handleEdit }>Edit Recipe</ButtonOval>
         </div>
      </NotebookComponentDefault>
   );
}

function InstructionShard({ recipe, onClick }: Props & ComponentPropsWithoutRef<'div'>) {

   return (
      <NotebookComponentDefault className={ styles.shardWrapper} onClick={ onClick }>
         <div className={ styles.wrapper } >
            <h3>How To Make</h3>
            <h4>Ingredients</h4>
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