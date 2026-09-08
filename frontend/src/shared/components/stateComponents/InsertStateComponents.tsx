import styles from './states.module.scss';
import { ErrorValidation } from '@/shared/lib/api/errorClasses';

export function InsertError({ error }: { error?: Error }) {
   return (
      <div className={ styles.error } aria-live='assertive'>
         { error instanceof ErrorValidation ?
            error.errorList.map((error) => (
               <div key={error.field}>
                  <p>Invalid {error.field}:</p>
                  <ul>
                     { error.issueList.map((problem) => (
                        <li key={problem}>{problem}</li>
                     )) }
                  </ul>
               </div>
            ))
         :
            <>
               <p>{ error?.message || "Issue loading content, please try again." }</p>
            </>
         }
      </div>
   )
}