import styles from './styles/loading.module.scss'
import AnimationSpin from '../animations/spin.animation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import BasicPage from '../pages/Basic.page';



export function StateLoadingInsert () {
   return ( <StateLoadingRaw className={ styles.insert } /> )
}



export function StateLoadingPage() {
   return(
      <BasicPage>
         <h1><StateLoadingRaw text={ "Fetching content from the server..." }/></h1>
         <p>
            If its been over 15 minutes since you last accessed this site the <br />
            server may have gone into sleep mode. Give it a moment to wake up.
         </p>
      </BasicPage>
   )
}



export function StateLoadingRaw({ text, ...rest }: { text?: string } & React.ComponentPropsWithoutRef<'p'>) {
   return (
      <div className={ styles.rawTextWrapper }>
         <AnimationSpin>
            <FontAwesomeIcon icon={faCircleNotch} />
         </AnimationSpin>
         <p { ...rest }>{ text ? text : "Loading..." }</p>
      </div>
   )
}