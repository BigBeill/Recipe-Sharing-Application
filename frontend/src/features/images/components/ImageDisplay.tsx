"use client"

import { TypeSignedImageUrl } from "../domain/image.types";

const RECIPE_IMAGE_FALLBACK = "/recipe-image-fallback.png";
const USER_IMAGE_FALLBACK = "/recipe-image-fallback.png";

type Props = React.ComponentPropsWithoutRef<'div'> & {
   category: 'recipes' | 'users';
   signedImageUrl?: TypeSignedImageUrl;
}

export default function ImageDisplay ({ signedImageUrl, category, ...rest }: Props) {

   const fallback = category === 'recipes' ? RECIPE_IMAGE_FALLBACK : USER_IMAGE_FALLBACK;

   return ( <img { ...rest } src={ signedImageUrl ?? fallback } /> );
   
}