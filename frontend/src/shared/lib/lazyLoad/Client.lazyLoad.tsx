import 'client-only';

import StateErrorPage, { StateErrorInsert } from "@/shared/view/states/Error.states";
import { StateLoadingInsert, StateLoadingPage } from "@/shared/view/states/Loading.states";
import { ServiceStateType } from "@/shared/domain/shared.types";
import { ComponentPropsWithoutRef } from 'react';

type RequireServiceStateReadyProps<T> = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
   serviceState: ServiceStateType<T>;
   children: (data: T) => React.ReactNode;
   isFullPage?: boolean;
}

export default function ClientLazyLoad<T>({ serviceState, children, isFullPage = true, ...rest }: RequireServiceStateReadyProps<T>) {
   switch (serviceState.status) {
      case 'loading':
         return isFullPage ? <StateLoadingPage { ...rest } /> : <StateLoadingInsert { ...rest } />
      case 'error':
         return isFullPage ? <StateErrorPage error={ serviceState.error } /> : <StateErrorInsert error={ serviceState.error } { ...rest } />
      case 'ready':
         return <>{children(serviceState.data)}</>
   }
}