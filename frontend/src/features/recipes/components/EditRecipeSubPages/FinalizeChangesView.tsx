import { ButtonOval, ButtonShielded } from "@/shared/components/Button.components";
import { NotebookPage } from "@/shared/components/Notebook";
import { InsertError } from "@/shared/components/stateComponents/InsertStateComponents";
import { StateLoadingInsert } from "@/shared/components/stateComponents/Loading.states";
import { ServiceMutationReturnType } from "@/shared/hooks/useServiceMutation";

interface ComponentProps {
   saveMutator: ServiceMutationReturnType<undefined, void>;
   deleteMutator: ServiceMutationReturnType<undefined, void>;
}

export default function EditRecipeFinalizeChangesView({ saveMutator, deleteMutator }: ComponentProps) {

   return (
      <NotebookPage>
         <h2>Finalize Recipe Changes</h2>
         <ButtonOval onClick={() => { saveMutator.send(undefined) } }>Save recipe</ButtonOval>

         { (saveMutator.status === 'loading' || deleteMutator.status === 'loading') && <StateLoadingInsert /> }
         { saveMutator.status === 'error' && <InsertError error={ saveMutator.error } /> }
         { deleteMutator?.status === 'error' && <InsertError error={ deleteMutator.error}/> }
         
         <ButtonShielded message="Save Recipe" onClick={ () => saveMutator.send(undefined) } />
         <ButtonShielded message="Delete Recipe" onClick={ () => { deleteMutator.send(undefined) } } />
      </NotebookPage>
   );
}