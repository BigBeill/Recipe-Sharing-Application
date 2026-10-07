import styles from "./styles/error.module.scss";
import { ErrorNotFound, ErrorUnauthorized, ErrorValidation } from "@/shared/domain/errorClasses";
import BasicPage from "../pages/Basic.page";
import { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<'div'> & {
   error?: Error;
}

export default function StateErrorPage({ error, ...rest }: Props) {
   return (
      <BasicPage { ...rest }>
         <>{ (() => {
            if (error instanceof ErrorValidation) { return (<>
               <h1>400 Error - Invalid Input</h1>
               <ValidationErrorToHtml error={ error } />
            </>); }
            
            else if (error instanceof ErrorUnauthorized) { return (<>
               <h1>401 Error - Unauthorized Access</h1>
               <p>{ error.message }</p>
            </>); }

            else if (error instanceof ErrorNotFound) { return (<>
               <h1>404 Error - Page not found</h1>
               <p>{ error.message }</p>
            </>); }

            else { return (<>
               <h1>500 Error - Unknown Issue</h1>
               <p>{ error?.message ? error.message : "We had an issue on our end, please wait a minute and try your request again" }</p>
            </>); }
         })() }</>
      </BasicPage>
   );
}

export function StateErrorInsert({ error, className, ...rest }: Props) {
   return (
      <div className={ [ styles.insertWrapper, className ].filter(Boolean).join(' ') } { ...rest } >
         { (() => {
            if (error instanceof ErrorValidation) { return ( <>
               <p>{ error.message }</p>
               <ValidationErrorToHtml error={ error } />
            </>); }
            else if (error instanceof ErrorUnauthorized) { return (<>
               <p>{ error.message }</p>
            </>); }
            else if (error instanceof ErrorNotFound) { return (<>
               <p>{ error.message }</p>
            </>); }
            else { return (<>
               <p>{ error?.message || 'We had an issue on our end, please wait a minute and try your request again' }</p>
            </>); }
         })() }
      </div>
   );
}






function ValidationErrorToHtml({ error }: { error: ErrorValidation }) {
   return (
      <ul>
         { error.rejectedFieldList.map((rejectedField, index) => (
            <li key={ index }>
               <p>Invalid { rejectedField.field }:</p>
               <ul>
                  { rejectedField.reasonList.map((reason, index) => (
                     <li key={ index }>{ reason }</li>
                  )) }
               </ul>
            </li>
         )) }
      </ul>
   )
}