import { ErrorNotFound } from "../lib/api/errorClasses";
import { Suspense, use } from "react";
import { StateLoadingPage } from "./stateComponents/Loading.states";
import StateErrorPage from "./stateComponents/Error.states";

interface LazyLoadProps {
   renderChildren: () => Promise<React.ReactNode>;
   fallback?: React.ReactNode;
}

export default function LazyLoad({ renderChildren, fallback = <StateLoadingPage /> }: LazyLoadProps) {
   return (
      <Suspense fallback={ fallback }>
         <LazyLoadPage renderChildren={ renderChildren } />
      </Suspense>
   )
}

async function LazyLoadPage({ renderChildren }: Omit<LazyLoadProps, "fallback">) {
   try {
      return use(renderChildren());
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
               <p>500 - There was an unknown issue fetching the resources needed from the server for this component </p>
            </StateErrorPage>
         );
      }
   }
}