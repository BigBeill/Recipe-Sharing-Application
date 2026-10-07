import styles from './styles/loading.module.scss'
import AnimationSpin from '../animations/spin.animation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import BasicPage from '../pages/Basic.page';
import { ComponentPropsWithoutRef } from 'react';



type Props = ComponentPropsWithoutRef<'div'>;

export function StateLoadingPage({ ...rest }: Props) {
   return(
      <BasicPage { ...rest } >
         <h1><StateLoadingRaw text={ "Fetching content from the server..." }/></h1>
         <p>
            If its been over 15 minutes since you last accessed this site the <br />
            server may have gone into sleep mode. Give it a moment to wake up.
         </p>
      </BasicPage>
   )
}

export function StateLoadingInsert ({ className, ...rest }: Props) {
   return ( <StateLoadingRaw className={ [styles.insertWrapper, className].filter(Boolean).join(' ') } { ...rest } /> )
}

export function StateLoadingRaw({ text, className, ...rest }: { text?: string } & React.ComponentPropsWithoutRef<'p'>) {
   return (
      <div className={ [styles.rawTextWrapper, className].filter(Boolean).join(' ') }>
         <AnimationSpin>
            <FontAwesomeIcon icon={faCircleNotch} />
         </AnimationSpin>
         <p { ...rest }>{ text ? text : "Loading..." }</p>
      </div>
   )
}