"use client"

import { ButtonOval } from "@/shared/components/Button.components";
import { InputText } from "@/shared/components/Input.components";
import { NotebookPage } from "@/shared/components/Notebook";
import { DataHandle } from "@/shared/shared.types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

export default function UserFilterPage() {

   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();
   const userId = searchParams.get('userId') || '';
   const name = searchParams.get('title') || '';

   const userIdRef = useRef<DataHandle<string>>(null);
   const nameRef = useRef<DataHandle<string>>(null);

   function handleFormSubmit() {
      const updatedParams = new URLSearchParams();
      const userId = userIdRef.current!.getData();
      const name = nameRef.current!.getData();
      if(userId) { updatedParams.set('userId', userId); }
      if(name) { updatedParams.set('name', name); }
      router.push(`${ pathname }?${ updatedParams }`);
   }

   return (
      <NotebookPage>
         <h1>Filter Users</h1>

         <InputText label='User ID' initial={ userId } dataRef={ userIdRef } placeholder="search by user ID" />
         <InputText label='Name' initial={ name } dataRef={ nameRef } placeholder='search by name' />

         <ButtonOval onClick={ handleFormSubmit }>search</ButtonOval>
      </NotebookPage>
   );
}