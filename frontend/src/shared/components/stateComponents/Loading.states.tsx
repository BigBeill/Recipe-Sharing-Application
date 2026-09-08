import styles from './states.module.scss'
import Spinner from '../icons/spinner';

interface StateLoadingProps {
   children?: React.ReactNode;
}

export function StateLoadingInsert ({ children }: StateLoadingProps) {
   return (
      <div className={ styles.warning }>
        { children ? children : <><Spinner /> <p>Your content is loading.</p></> }
      </div>
   )
}

export function StateLoadingPage({ children }: StateLoadingProps) {
   return(
      <div className="standardPage">
         <div> 
            <Spinner /> <p>Loading...</p>
         </div>
         { children ? children : 
            <p>
               If its been over 15 minutes since you last accessed this site the <br />
               server may have gone into sleep mode. Give it a moment to wake up.
            </p>
         }
      </div>
   )
}