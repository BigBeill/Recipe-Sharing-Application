import ImageUploader from "@/features/images/components/ImageUploader";
import { PackagedImageType } from "@/features/images/domain/image.types";
import { DataHandle} from "@/shared/domain/shared.types";
import { Ref } from "react";
import { NotebookComponentDefault } from "@/shared/view/components/notebookPageSpecific/default.notebookComponent";
import { InputChooseValue } from "@/shared/view/components/Input.components";

interface ComponentProps {
   refs: {
      image: Ref<DataHandle<File | null>>;
      visibility: Ref<DataHandle<'public' | 'private' | 'personal'>>;
   }
   initial: { 
      image?: PackagedImageType, 
      visibility: 'public' | 'private' | 'personal' 
   }
}

export default function EditRecipeAdditionalInfoView ({ refs, initial }: ComponentProps) {
   return (
      <NotebookComponentDefault>
         <h2>Additional Information</h2>

         <div style={{ width: '12rem', height: '12rem', margin: '0rem 0rem 3rem 3rem' }}>
            <ImageUploader 
               ref={ refs.image }
               initial={ initial?.image }
               category='recipe'
            />
         </div>

         <InputChooseValue<string>
            type='radio'
            initial={ initial?.visibility }
            label="Recipe Visibility" 
            ref={ refs.visibility as Ref<DataHandle<string | undefined>> }
            optionList={ [
               { value: 'public', label: "Public - Anyone can view this recipe" },
               { value: 'private', label: "Private - You and friends can view this recipe" },
               { value: 'personal', label: "Personal - Only you can view this recipe" }
            ] }
         />
      </NotebookComponentDefault>
   )
}