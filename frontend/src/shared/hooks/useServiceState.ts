import "client-only";

import { useCallback, useEffect, useRef, useState } from "react";
import { ServiceStateType } from "../shared.types";
import { ErrorNotFound } from "../lib/api/errorClasses";

type SettledState<T> = Exclude<ServiceStateType<T>, { status: 'loading' }>;

type UseServiceStateReturnType<T> = ServiceStateType<T> & {
   overrideOutput: (output: T) => void
   waitForLoad: () => Promise<SettledState<T>>
}

export default function useServiceState<T>(fetcher: () => Promise<T>, refetchOn: unknown[]): UseServiceStateReturnType<T> {
   const [state, setState] = useState<ServiceStateType<T>>({ status: 'loading' });
   const requestIdRef = useRef(0);
   const settledRef = useRef<Promise<SettledState<T>> | null>(null);

   useEffect(() => {
      const requestId = ++requestIdRef.current;
      setState({ status: 'loading' });

      const settled: Promise<SettledState<T>> = fetcher().then(
         (data) => ({ status: 'ready', data }),
         (error) => error instanceof ErrorNotFound
            ? { status: 'not-found' }
            : { status: 'error', error }
      );

      settledRef.current = settled;

      settled.then((result) => {
         if (requestIdRef.current !== requestId) { return; }
         setState(result);
      });
   }, refetchOn);

   const overrideOutput = useCallback((output: T) => {
      requestIdRef.current++;
      const result: SettledState<T> = { status: 'ready', data: output };
      settledRef.current = Promise.resolve(result);
      setState(result)
   },[]);

   const waitForLoad = useCallback(() => settledRef.current!, []);

   return { 
      ...state,
      overrideOutput,
      waitForLoad,
   };
}