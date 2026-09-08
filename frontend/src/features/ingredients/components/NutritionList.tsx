import styles from './NutritionList.module.scss';
import{ TypeNutrition } from "../domain/ingredient.types";

type Props = React.ComponentPropsWithoutRef<'div'> & {
   nutrition?: TypeNutrition;
}

export default function NutritionList({ nutrition, className, ...rest }: Props) {

   if (!nutrition) { return null; }
   return (
      <div className={ [styles.wrapper, className].filter(Boolean).join(' ') } { ...rest }>
         <h3>Nutrition</h3>
         <ul>
            { nutrition ? 
            <>
               <li><span>Calories:</span><span>{ nutrition.calories.toFixed(0) }</span></li>
               <li><span>Fat:</span><span>{ nutrition.fat.toFixed(2) }</span>g</li>
               <li><span>Cholesterol:</span><span>{ nutrition.cholesterol.toFixed(2) }mg</span></li>
               <li><span>Sodium:</span><span>{ nutrition.sodium.toFixed(2) }mg</span></li>
               <li><span>Potassium:</span><span>{ nutrition.potassium.toFixed(2) }mg</span></li>
               <li><span>Carbohydrates:</span><span>{ nutrition.carbohydrates.toFixed(2) }g</span></li>
               <li><span>Fibre:</span><span>{ nutrition.fibre.toFixed(2) }g</span></li>
               <li><span>Sugar:</span><span>{ nutrition.sugar.toFixed(2) }g</span></li>
               <li><span>Protein:</span><span>{ nutrition.protein.toFixed(2) }g</span></li>
            </>
            : null }
         </ul>
      </div>
   )
}