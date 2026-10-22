import Elysia, { status } from "elysia"
import { imagesService } from "../../../container";
import { UploadValidator } from "./validators/upload.validator";
import { GetValidator } from "./validators/get.validator";
import { authorizeMiddleware } from "../../auth/auth.middleware";
import { DepartingStringValidator } from "../../../global/departingData/validators/primitives/departingString.validator";
import { ImageReferenceValidator } from "./validators/imageReference.validator";

const service = imagesService;

export const imagesController = new Elysia({ prefix: '/image' })

   .get('/:location/:fileName', 
      async ({ params }) => {
         const key = `${params.location}/${params.fileName}`;
         const imageURL = await service.getPresignedURL(key);
         return status(200, imageURL);
      },
      {
         params: GetValidator,
         response: DepartingStringValidator,
      }
   )

   .use(authorizeMiddleware)

   .post('/upload',
      async ({ body, authId }) => {
         const { file, location } = body;
         const imageReference = await service.pushImage(location, file, { authId });
         return status(201, imageReference)
      },
      {
         body: UploadValidator,
         response: { 201: ImageReferenceValidator },
      }
   )