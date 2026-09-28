import styles from "./styles/error.module.scss";
import { ErrorNotFound, ErrorUnauthorized, ErrorValidation } from "@/shared/lib/api/errorClasses";
import BasicPage from "../pages/Basic.page";

interface Props {
   error?: Error;
}

export default function StateErrorPage({ error }: Props) {

   if (error instanceof ErrorValidation) {
      return (
         <BasicPage>
            <h1>400 Error - Invalid Input</h1>
            <ValidationErrorToHtml error={ error } />
         </BasicPage>
      );
   }
   
   else if (error instanceof ErrorUnauthorized) {
      return (
         <BasicPage>
            <h1>401 Error - Unauthorized Access</h1>
            <p>Your account does not have access to this resource</p>
         </BasicPage>
      );
   }

   else if (error instanceof ErrorNotFound) {
      return (
         <BasicPage>
            <h1>404 Error - Page not found</h1>
            <p> Server was not able to find the resource you are looking for</p>
         </BasicPage>
      );
   }

   else {
      return (
         <BasicPage>
            <h1>500 Error - Unknown Issue</h1>
            <p>We had an issue on our end, please wait a minute and try your request again</p>
         </BasicPage>
      );
   }
}

export function StateErrorInsert({ error }: Props) {
   
   if (error instanceof ErrorValidation) {
      return (
         <div className={ styles.divInsert }>
            <p>Invalid Input</p>
            <ValidationErrorToHtml error={ error } />
         </div>
      );
   }
   
   else if (error instanceof ErrorUnauthorized) { return (<p className={ styles.insert }>Your account does not have access to this resource</p>); }

   else if (error instanceof ErrorNotFound) { return (<p className={ styles.insert }> Server was not able to find the resource you are looking for</p>); }

   else { return (<p className={ styles.insert }>We had an issue on our end, please wait a minute and try your request again</p>); }
}






function ValidationErrorToHtml({ error }: { error: ErrorValidation }) {
   return (
      <ul>
         { error.errorList.map((errorItem, index) => (
            <li key={ index }>
               <p>Invalid { errorItem.field }:</p>
               <ul>
                  { errorItem.issueList.map((issue, index) => (
                     <li key={ index }>{ issue }</li>
                  )) }
               </ul>
            </li>
         )) }
      </ul>
   )
}