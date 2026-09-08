import { ServiceStateType } from "../shared.types";
import StateErrorPage from "./stateComponents/Error.states";
import { StateLoadingPage } from "./stateComponents/Loading.states";
import { StateNotFoundPage } from "./stateComponents/NotFound.states";

interface RequireServiceStateReadyProps<T> {
   serviceState: ServiceStateType<T>;
   children: (data: T) => React.ReactNode;
}

export default function RequireServiceStateReady<T>({ serviceState, children }: RequireServiceStateReadyProps<T>) {
   switch (serviceState.status) {
      case 'loading':
         return <StateLoadingPage />
      case 'not-found':
         return <StateNotFoundPage />
      case 'error':
         return <StateErrorPage />
      case 'ready':
         return <>{children(serviceState.data)}</>
   }
}