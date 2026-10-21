import Elysia from "elysia"
import { imagesService } from "../../../container";
import { UploadImageValidator } from "./validators/uploadImage.validator";
import { GetImageValidator } from "./validators/getImage.validator";
import { authorizeMiddleware } from "../../auth/auth.middleware";

const service = imagesService;

export const imagesController = new Elysia({ prefix: '/image' })

   .get(
      '/:location/:fileName',
      async ({ params }) => {
         const key = `${params.location}/${params.fileName}`;
         return await service.getPresignedURL(key);
      },
      {
         params: GetImageValidator,
      }
   )

   .use(authorizeMiddleware)

   .post( '/upload',
      async ({ body, authId }) => {
         const { file, location } = body;
         return await service.pushImage(location, file, { authId });
      },
      {
         body: UploadImageValidator
      }
   )