import { createContext, useContext } from "react";
import { TypeServiceMutator } from "./useServiceMutation";

type TypeEditContext = {
   active: boolean;
   trigger: () => void;
   saveMutator: TypeServiceMutator<never, void>;
};

const EditContext = createContext<TypeEditContext | null>(null);

export const EditProvider = EditContext.Provider;
export const useEditContext = () => {
   const context = useContext(EditContext);
   if (!context) { throw new Error('useEditContext must be used inside an EditProvider'); }
   return context;
};