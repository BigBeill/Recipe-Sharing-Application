import { ServiceMutationReturnType } from "@/shared/lib/hooks/useServiceMutation";
import { ButtonShielded } from "@/shared/view/components/Button.components";
import { NotebookComponentDefault } from "@/shared/view/components/notebookPageSpecific/default.notebookComponent";
import { StateErrorInsert } from "@/shared/view/states/Error.states";
import { StateLoadingInsert } from "@/shared/view/states/Loading.states";


interface ComponentProps {
   saveMutator: ServiceMutationReturnType<undefined, void>;
   deleteMutator: ServiceMutationReturnType<undefined, void>;
}

export default function EditRecipeShardSubmit({ saveMutator, deleteMutator }: ComponentProps) {

   return (
      <NotebookComponentDefault style={ { display: 'flex', flexDirection: 'column' } }>
         <h2>Finalize Recipe Changes</h2>

         <div style={ { flex: '1' } }>
            { (saveMutator.status === 'loading' || deleteMutator.status === 'loading') && <StateLoadingInsert /> }
            { saveMutator.status === 'error' && <StateErrorInsert error={ saveMutator.error } /> }
            { deleteMutator?.status === 'error' && <StateErrorInsert error={ deleteMutator.error}/> }
         </div>
         
         <ButtonShielded message="Save Recipe" onClick={ () => saveMutator.send() } />
         <ButtonShielded message="Delete Recipe" onClick={ () => { deleteMutator.send() } } />
      </NotebookComponentDefault>
   );
}