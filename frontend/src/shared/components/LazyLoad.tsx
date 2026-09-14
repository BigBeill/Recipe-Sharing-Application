import { ErrorNotFound } from "../lib/api/errorClasses";
import { Suspense } from "react";
import { StateLoadingPage } from "./stateComponents/Loading.states";
import StateErrorPage from "./stateComponents/Error.states";

interface LazyLoadProps<T>{
   serviceCall: () => Promise<T>;
   children: (response: T) => React.ReactNode;
   fallback?: React.ReactNode;
}

export default function LazyLoad<T>({ serviceCall, children, fallback = <StateLoadingPage /> }: LazyLoadProps<T>) {
   return (
      <Suspense fallback={ fallback }>
         <LazyLoadPage serviceCall={ serviceCall }>
            { children }
         </LazyLoadPage>
      </Suspense>
   )
}

async function LazyLoadPage<T>({ serviceCall, children }: Omit<LazyLoadProps<T>, "fallback">) {
   let response: T;
   try {
      response = await serviceCall();
   }
   catch (error) {
      if (error instanceof ErrorNotFound) { 
         return ( 
            <StateErrorPage>
               <p>404 - The resources needed to load this component could not be fetched from the server</p>
            </StateErrorPage> 
         );
      }
      else { 
         return (
            <StateErrorPage>
               <p>500 - There was an unknown issue fetching the resources needed from the server for this component</p>
            </StateErrorPage>
         );
      }
   }

   return children(response);
}