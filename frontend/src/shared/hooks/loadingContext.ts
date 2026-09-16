import { createContext, useContext } from "react";

const LoadingContext = createContext<boolean>(false);

export const LoadingProvider = LoadingContext.Provider;
/** Returns the nearest shared loading state, defaulting to `false` without a provider. */
export const useLoading = () => useContext(LoadingContext);