import { PackagedImageType, UnpackedImageType } from "@/features/images/domain/image.types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const RECIPE_IMAGE_FALLBACK = "/recipe-image-fallback.png";
const USER_IMAGE_FALLBACK = "/recipe-image-fallback.png";

export function unpackImage (packagedImage: PackagedImageType | undefined): UnpackedImageType {
   const FALLBACK_IMAGE = `${RECIPE_IMAGE_FALLBACK}`;
   const imageSrc = packagedImage ? `${BASE_URL}${packagedImage.url}` : FALLBACK_IMAGE;
   return {
      src: imageSrc,
      alt: "",
      loading: "lazy" as const,
      onError: (error: React.SyntheticEvent<HTMLImageElement, Event>) => {
         console.log("image failed do download attempting to get the fallback image:", FALLBACK_IMAGE)
         if (error.currentTarget.src.endsWith(FALLBACK_IMAGE)) { return; }
         error.currentTarget.onerror = null;
         error.currentTarget.src = FALLBACK_IMAGE;
      },
   }
}