"use client"

import { PackagedImageType } from "../domain/image.types";
import { unpackImage } from "../services/image.services";

type Props = React.ComponentPropsWithoutRef<'div'> & {
   packagedImage: PackagedImageType | undefined;
}

export default function ImageDisplay ({ packagedImage, ...rest }: Props) {

   const image = unpackImage(packagedImage);

   return (
      <img { ...image } { ...rest } />
   );

}