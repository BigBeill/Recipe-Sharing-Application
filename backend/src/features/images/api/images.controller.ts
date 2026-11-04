import Elysia, { status } from "elysia"
import { imagesService } from "../../../container";
import { authenticateMiddleware, authorizeMiddleware } from "../../auth/auth.middleware";
import { ValidatorCommonImageReference } from "../domain/validators/imageReference.validator";
import { ValidatorIncomingImagesUploadBody } from "./validators/upload.validator";

const service = imagesService;

export const imagesController = new Elysia({ prefix: '/images' })

   .use(authenticateMiddleware)
   .use(authorizeMiddleware)

   .post('/upload',
      async ({ body, authId }) => {
         const { file, location } = body;
         const imageReference = await service.pushImage(location, file, { authId });
         return status(201, imageReference)
      },
      {
         body: ValidatorIncomingImagesUploadBody,
         response: { 201: ValidatorCommonImageReference },
      }
   )