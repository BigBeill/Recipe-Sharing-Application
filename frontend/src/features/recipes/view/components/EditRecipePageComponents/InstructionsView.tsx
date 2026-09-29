import { DataHandle } from "@/shared/domain/shared.types";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { KeyboardEvent, Ref, useEffect, useRef } from "react";
import { useInteractableList } from "@/shared/lib/hooks/useInteractableList";
import { NotebookComponentDefault } from "@/shared/view/components/notebookPageSpecific/default.notebookComponent";
import { ButtonOval } from "@/shared/view/components/Button.components";
import { InputString } from "@/shared/view/components/Input.components";

interface ComponentProps {
   refs: {
      instructionList: Ref<DataHandle<string[]>>;
   }
   initial: { 
      instructionList: string[];
   }
}

export default function EditRecipeInstructionsView ({ refs, initial }: ComponentProps) {

   useEffect (() => {
      console.log("instance of EditRecipeInstructionView created");
   }, [])

   const newInstructionRef = useRef<DataHandle<string>>(null);

   const instructionList = useInteractableList({
      initial: initial.instructionList,
      ref: refs.instructionList,
      renderItemContent: (item: string) => (
         <p>{ item }</p>
      ),
      renderItemOptions: (item: string, index: number) => (
         <FontAwesomeIcon 
            role='button'
            tabIndex={ 0 }
            aria-label={ `Remove instruction ${index + 1}` }
            icon={ faTrash } 
            style={ { color: "#575757" } } 
            onClick={ () => { instructionList.removeIndex(index) } } 
         />
      ),
      renderItemHeader: (item: string, index: number) => (
         <h4>Step { index + 1 } </h4>
      ),
   });

   function addInstruction() {
      const newInstruction = newInstructionRef.current!.getData();
      if(newInstruction.length < 3) { return; }
      instructionList.addItem(newInstruction);
      newInstructionRef.current!.setData('');
   }

   function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (event.key === 'Enter') { addInstruction() }
   }

   return (
      <NotebookComponentDefault style={ { display: 'flex', flexDirection: 'column' } }>
         <h2>Recipe Instructions</h2>
         { instructionList.htmlView }

         <InputString
            type="text"
            label="New Instruction"
            placeholder="add a new instruction"
            onKeyDown={ (event) => { handleKeyDown(event) } }
            ref={ newInstructionRef }
         />
         <ButtonOval onClick={() => { addInstruction(); }}>Add Instruction</ButtonOval>
      </NotebookComponentDefault>
   )
}