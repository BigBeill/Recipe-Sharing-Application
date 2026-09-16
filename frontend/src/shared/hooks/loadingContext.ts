import { createContext, useContext } from "react";

const LoadingContext = createContext<boolean>(false);

export const LoadingProvider = LoadingContext.Provider;
export const useLoading = () => useContext(LoadingContext);