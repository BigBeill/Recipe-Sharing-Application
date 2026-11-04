import { TypeImageReference } from "@/features/images/domain/image.types";
import { TypeImageApi } from "./image.api";

export function createImageService(api: TypeImageApi) {
   return {
      upload: async (location: ('recipes' | 'users'), file: File): Promise<TypeImageReference> => {
         return await api.upload(location, file);
      }
   }
}