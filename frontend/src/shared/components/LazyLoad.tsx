import { notFound } from "next/navigation";
import { ErrorNotFound } from "../lib/api/errorClasses";
import { Suspense } from "react";
import { StateLoadingPage } from "./stateComponents/Loading.states";

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
      if (error instanceof ErrorNotFound) { return notFound(); }
      throw error;
   }

   return children(response);
}