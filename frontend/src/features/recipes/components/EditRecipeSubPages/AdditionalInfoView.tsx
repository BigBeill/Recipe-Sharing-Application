import ImageUploader from "@/features/images/components/ImageUploader";
import { PackagedImageType } from "@/features/images/domain/image.types";
import { InputRadioButtons } from "@/shared/components/Input.components";
import { NotebookPage } from "@/shared/components/Notebook";
import { DataHandle} from "@/shared/shared.types";
import { Ref } from "react";

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
      <NotebookPage>
         <h2>Additional Information</h2>

         <div style={{ width: '12rem', height: '12rem', margin: '0rem 0rem 3rem 3rem' }}>
            <ImageUploader 
               imageRef={ refs.image }
               initial={ initial?.image }
               category='recipe'
            />
         </div>

         <InputRadioButtons 
            initial={ initial?.visibility }
            legend="Recipe Visibility" 
            ref={ refs.visibility }
            optionList={ [
               { value: 'public', label: "Public - Anyone can view this recipe" },
               { value: 'private', label: "Private - You and friends can view this recipe" },
               { value: 'personal', label: "Personal - Only you can view this recipe" }
            ] }
         />
      </NotebookPage>
   )
}