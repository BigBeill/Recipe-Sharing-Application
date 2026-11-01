"use client"

import useServiceState from "@/shared/lib/hooks/useServiceState";
import { TypeImageReference } from "../domain/image.types";
import { imageService } from "../services/image.service.client";

const RECIPE_IMAGE_FALLBACK = "/recipe-image-fallback.png";
const USER_IMAGE_FALLBACK = "/recipe-image-fallback.png";

type Props = React.ComponentPropsWithoutRef<'div'> & {
   category: 'recipes' | 'users';
   imageReference?: TypeImageReference;
}

export default function ImageDisplay ({ imageReference, category, ...rest }: Props) {

   const fallback = category === 'recipes' ? RECIPE_IMAGE_FALLBACK : USER_IMAGE_FALLBACK;

   const imageUrlState = useServiceState(async () => {
      if (imageReference) {
         return await imageService.get(imageReference.key);
      }
      else { return fallback; }
   }, [imageReference])

   return (
      <img { ...rest } src={ imageUrlState.status === 'ready' ? imageUrlState.data : fallback } />
   );

}