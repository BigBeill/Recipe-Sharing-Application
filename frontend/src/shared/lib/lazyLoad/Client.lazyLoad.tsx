import 'client-only';

import StateErrorPage from "@/shared/view/states/Error.states";
import { StateLoadingPage } from "@/shared/view/states/Loading.states";
import { ErrorNotFound } from "../api/errorClasses";
import { ServiceStateType } from "@/shared/domain/shared.types";

interface RequireServiceStateReadyProps<T> {
   serviceState: ServiceStateType<T>;
   children: (data: T) => React.ReactNode;
}

export default function ClientLazyLoad<T>({ serviceState, children }: RequireServiceStateReadyProps<T>) {
   switch (serviceState.status) {
      case 'loading':
         return <StateLoadingPage />
      case 'not-found':
         return <StateErrorPage error={ new ErrorNotFound() } />
      case 'error':
         return <StateErrorPage />
      case 'ready':
         return <>{children(serviceState.data)}</>
   }
}