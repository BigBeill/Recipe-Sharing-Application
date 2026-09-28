import "server-only";

import { Suspense } from "react";
import { StateLoadingPage } from "@/shared/view/states/Loading.states";
import StateErrorPage from "@/shared/view/states/Error.states";

interface LazyLoadProps {
   renderChildren: () => Promise<React.ReactNode>;
   fallback?: React.ReactNode;
}

export default function ServerLazyLoad({ renderChildren, fallback = <StateLoadingPage /> }: LazyLoadProps) {
   return (
      <Suspense fallback={ fallback }>
         <LazyLoadPage renderChildren={ renderChildren } />
      </Suspense>
   );
}

async function LazyLoadPage({ renderChildren }: Omit<LazyLoadProps, "fallback">) {
   try { return await renderChildren(); }
   catch (error) {
      if (error instanceof Error) {
         return (<StateErrorPage error={ error } />); 
      }
      else {
         return (<StateErrorPage/>)
      }
   }
}