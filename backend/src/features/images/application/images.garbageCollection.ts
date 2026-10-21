import type { ImagesService } from "./images.service";

const TTL = 24 * 60 * 60 * 1000;    // unclaimed upload deleted after one day
const INTERVAL = 60 * 60 * 1000;    // check every one hour

export default function imageGarbageCollection(imageService: ImagesService) {
   const timer = setInterval(
      () => imageService.deleteExpiredImages(TTL),
      INTERVAL
   );
   return () => clearInterval(timer);
}