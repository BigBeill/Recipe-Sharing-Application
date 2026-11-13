import Elysia, { status } from "elysia"
import { authenticateMiddleware } from "../../authentication/authentication.middleware";
import { ValidatorCommonImageReference } from "../domain/validators/imageReference.validator";
import { ValidatorIncomingImagesUploadBody } from "./validators/upload.validator";
import { authorizeMiddleware } from "../../authorization/authorization.middleware";
import type { ImagesService } from "../application/images.service";

export const imagesController = new Elysia({ prefix: '/images' })
   .use(authenticateMiddleware)
   .derive(async ({ scope }) => ({
      service: scope.resolve<ImagesService>('imagesService'),
   }))
   .use(authorizeMiddleware)

   .post('/upload',
      async ({ body, service }) => {
         const { file, location } = body;
         const imageReference = await service.pushImage(location, file);
         return status(201, imageReference)
      },
      {
         body: ValidatorIncomingImagesUploadBody,
         response: { 201: ValidatorCommonImageReference },
      }
   )