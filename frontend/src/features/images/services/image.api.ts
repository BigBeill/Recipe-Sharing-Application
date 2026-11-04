import { TypeApiCaller } from "@/shared/lib/api/types";
import { TypeImageReference } from "../domain/image.types";

export function createImageApi(call: TypeApiCaller) {
   return {
      upload: (location: 'users' | 'recipes', file: File) => {
         const body = new FormData();
         body.append('location', location);
         body.append('file', file);

         return call<TypeImageReference>({
            url: `/images/upload`,
            method: 'post',
            body,
         });
      },
   }
}

export type TypeImageApi = ReturnType<typeof createImageApi>;