import Elysia from "elysia"
import { imagesService } from "../../container";
import { UploadImageValidator } from "./validators/uploadImage.validator";
import { GetImageValidator } from "./validators/getImage.validator";
import { authorizeMiddleware } from "../auth/auth.middleware";

const service = imagesService;

export const imagesController = new Elysia({ prefix: '/image' })
   .get(
      '/:context/:fileName',
      async ({ params }) => {
         const { context, fileName } = params;
         const file = await service.getImage(context, fileName);

         return new Response(file, {
            headers: {
               'Content-Type': 'image/webp',
               'X-Content-Type-Options': 'nosniff',
            }
         });
      },
      {
         params: GetImageValidator,
      }
   )
   .use(authorizeMiddleware)
   .post( '/upload',
      async ({ body, authId }) => {
         const { image } = body;
         const imageLink = await service.uploadImage(image, authId);
         return { data: imageLink };
      },
      {
         massage: "image uploaded",
         body: UploadImageValidator
      }
   )