import styles from './recipePreview.module.scss';
import { RecipeType } from "../domain/recipes.types";
import GrowingText from "@/shared/components/GrowingText";
import ImageDisplay from "@/features/images/components/ImageDisplay";



/*
This is very similar to recipePage.tsx except it puts everything on a single white page.
Used for showing the contents of recipes where the full notebook doesn't make sense
*/



export default function RecipePreview({ recipe }: { recipe: RecipeType }) {

   return (
      <div className={ styles.preview }>
         <GrowingText text={recipe.title}/>

         <ImageDisplay packagedImage={recipe.image} />

         <div className="description">
            <h3>Description</h3>
            <p>{recipe.description}</p>
         </div>

         <div className="nutrition">
            <h3>Nutrition</h3>
            <ul>
               { recipe.nutrition ? 
               <>
                  <li>Calories: {recipe.nutrition.calories.toFixed(2)}</li>
                  <li>Fat: {recipe.nutrition.fat.toFixed(2)}</li>
                  <li>Cholesterol: {recipe.nutrition.cholesterol.toFixed(2)}</li>
                  <li>Sodium: {recipe.nutrition.sodium.toFixed(2)}</li>
                  <li>Potassium: {recipe.nutrition.potassium.toFixed(2)}</li>
                  <li>Carbohydrates: {recipe.nutrition.carbohydrates.toFixed(2)}</li>
                  <li>Fibre: {recipe.nutrition.fibre.toFixed(2)}</li>
                  <li>Sugar: {recipe.nutrition.sugar.toFixed(2)}</li>
                  <li>Protein: {recipe.nutrition.protein.toFixed(2)}</li>
               </>
               : null }
            </ul>
         </div>

         <div className="instructions">
            <h3>Instructions</h3>
            <ol>
               {recipe.instructionList.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
               ))}
            </ol>
         </div>

         <div className="ingredients">
            <h3>Ingredients</h3>
            <ul>
               {recipe.ingredientList.map((ingredient, index) => (
                  <li key={index}>
                     {ingredient.label ? ingredient.label : `${ingredient.portion?.amount} ${ingredient.portion?.description} of [${ingredient.description}]`}
                  </li>
               ))}
            </ul>
         </div>

      </div>
   );
}
