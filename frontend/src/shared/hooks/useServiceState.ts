import "client-only";

import { useCallback, useEffect, useRef, useState } from "react";
import { ServiceStateType } from "../shared.types";
import { ErrorNotFound } from "../lib/api/errorClasses";

type UseServiceStateReturnType<T> = ServiceStateType<T> & {
   overrideOutput: (output: T) => void
}

export default function useServiceState<T>(fetcher: () => Promise<T>, refetchOn: unknown[]): UseServiceStateReturnType<T> {
   const [state, setState] = useState<ServiceStateType<T>>({ status: 'loading' });
   const requestIdRef = useRef(0);

   useEffect(() => {
      const requestId = ++requestIdRef.current;
      setState({ status: 'loading' });

      fetcher()
         .then((data) => {
            if (requestIdRef.current !== requestId) { return; }
            setState({ status: 'ready', data });
         })
         .catch(error => {
            if (requestIdRef.current !== requestId) { return; }
            if (error instanceof ErrorNotFound) { setState({ status:'not-found' }); }
            else { setState({ status: 'error', error }); }
         });
   }, refetchOn);

   const overrideOutput = useCallback((output: T) => {
      requestIdRef.current++;
      setState({ status: 'ready', data: output })
   },[]);

   return { 
      ...state,
      overrideOutput 
   };
}