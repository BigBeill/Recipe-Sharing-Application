import { randomUUID } from "crypto";
import bucketClient from "../infrastructure/bucket";
import type { ImagesRepository } from "../infrastructure/images.repository";
import type { AuthIdParam } from "../../../common/api/authIdParam";
import { UnauthorizedError } from "../../../global/departingData/errorClasses";
import type { Types } from "mongoose";
import removeMongooseNoise from "../../../common/utils/removeMongooseNoise";
import type { TypeImageReference } from "../domain/images.types";

const MAX_BYTES = 5 * 1024 * 1024;

function matches(bytes: Uint8Array, offset: number, signature: number[]) {
   return signature.every((byte, i) => bytes[offset + i] === byte);
}



function detectImageType(bytes: Uint8Array) {
   if (matches(bytes, 0, [0xff, 0xd8, 0xff])) { return "image/jpeg"; }
   if (matches(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) { return "image/png"; }
   if (matches(bytes, 0, [0x52, 0x49, 0x46, 0x46]) && matches(bytes, 8, [0x57, 0x45, 0x42, 0x50])) { return "image/webp"; }
   return null;
}



export class ImagesService {
   private readonly repository: ImagesRepository;

   constructor({ imagesRepository }: { imagesRepository: ImagesRepository }) {
      this.repository = imagesRepository
   }



   async claimImage(_id: Types.ObjectId, { authId }: AuthIdParam): Promise<TypeImageReference> {
      const imageRecord = await this.repository.getImageReference(_id);
      if (!imageRecord.owner.equals(authId)) { throw new UnauthorizedError(); }
      await this.repository.updateImageReferenceStatus(imageRecord._id, 'active');
      return { ...removeMongooseNoise(imageRecord), status: 'active' }
   }



   async deleteExpiredImages(ttlMs: number): Promise<void> {
      const cutoff = new Date(Date.now() - ttlMs);

      const candidates = await this.repository.searchImageReference({ statusList: ["deleting", "pending"], cutoff })

      for (const imageReference of candidates) {
         try {
            if (imageReference.status === "pending") {
               await this.repository.updateImageReferenceStatus(imageReference._id, 'deleting');
            }

            await bucketClient.file(imageReference.key).delete();
            await this.repository.deleteImageReference(imageReference._id);
         }
         catch (error) {
            console.error(`Failed to clean up image ${imageReference.key}`, error);
         }
      }
   }



   async delete(_id: Types.ObjectId): Promise<void> {
      const imageRecord = await this.repository.getImageReference(_id);
      await bucketClient.file(imageRecord.key).delete();
      await this.repository.deleteImageReference(_id);
   }



   async getImageReference(_id: Types.ObjectId): Promise<TypeImageReference> {
      return await this.repository.getImageReference(_id);
   }

   

   async getPresignedURL(key: string): Promise<string> {
      return bucketClient.presign(key);
   }



   async pushImage(location: ('recipes' | 'users'), file: File, { authId }: AuthIdParam): Promise<TypeImageReference> {
      if (!authId){ throw new UnauthorizedError(); }
      if (file.size > MAX_BYTES) { throw new Error("Image too large"); }

      const header = new Uint8Array(await file.arrayBuffer()).subarray(0, 12);
      const type = detectImageType(header);
      if (!type) { throw new Error("Unsupported image type"); }

      const key = `${location}/${randomUUID()}`;
      await bucketClient.file(key).write(file, { type: "image/webp" });
      const imageReference = await this.repository.createImageReference({ key, owner: authId, status: 'pending' });

      return imageReference;
   }



   async update(oldImageReferenceId: Types.ObjectId | undefined, newImageReference: TypeImageReference): Promise<TypeImageReference> {
      if (!oldImageReferenceId) { return newImageReference; }
      else {
         const oldImageReference = await this.getImageReference(oldImageReferenceId);
         if (oldImageReference.key === newImageReference.key) {
            this.repository.deleteImageReference(oldImageReference._id);
            return newImageReference;
         }
         else {
            await this.delete(oldImageReferenceId);
            return newImageReference;
         }
      }
   }



}