"use client"

import { DataHandle } from "@/shared/domain/shared.types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { NotebookComponentDefault } from "@/shared/view/components/notebookPageSpecific/default.notebookComponent";
import { ButtonOval } from "@/shared/view/components/Button.components";
import { InputString } from "@/shared/view/components/Input.components";

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
      <NotebookComponentDefault>
         <h1>Filter Users</h1>

         <InputString type='text' label='User ID' initial={ userId } ref={ userIdRef } placeholder="search by user ID" />
         <InputString type='text' label='Name' initial={ name } ref={ nameRef } placeholder='search by name' />

         <ButtonOval onClick={ handleFormSubmit }>search</ButtonOval>
      </NotebookComponentDefault>
   );
}