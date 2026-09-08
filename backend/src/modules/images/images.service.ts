import { randomUUIDv7 } from "bun";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../common/types/error.types";
import { env } from "../../config/env";
import type { ImageType, TrackedImageType } from "./images.types";

const IMAGE_CONTEXTS = ['tempUploads', 'avatars', 'recipes'] as const;
type ImageContext = typeof IMAGE_CONTEXTS[number];

// TODO: Change from in-memory storage to mongoose storage
const imageStore = new Map<string, TrackedImageType>();

function isImageContext(value: string): value is ImageContext {
   return (IMAGE_CONTEXTS as readonly string[]).includes(value);
}

const PENDING_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_PENDING_PER_USER = 5;

export class ImagesService {

   startCleanupJob() {
      setInterval(() => this.cleanupPendingImages(), PENDING_TTL_MS);
   }

   async claimImage(imageUrl: string, ownerId: string): Promise<TrackedImageType> {
      const image = [...imageStore.values()].find(img => img.url === imageUrl);

      if (!image) throw new NotFoundError('Image not found');
      if (image.ownerId !== ownerId) throw new UnauthorizedError('Image does not belong to you');
      if (image.status === 'active') throw new ValidationError('Image is already in use');

      image.status = 'active';
      return image;
   }

   private async cleanupPendingImages() {
      const now = Date.now();
      for (const [id, image] of imageStore.entries()) {
         const isExpired = now - image.uploadedAt.getTime() > PENDING_TTL_MS;
         if (image.status === 'pending' && isExpired) {
            // Delete from disk
            await this.deleteImage('tempUploads', image.filename).catch(() => {});
            imageStore.delete(id);
         }
      }
   }

   async deleteImage(context: ImageContext, filename: string) {
      const filePath = this.validatePath(context, filename);
      const file = Bun.file(filePath);

      const fileExists = await file.exists();
      if (!fileExists) { throw new NotFoundError('Image not found'); }

      await file.delete();
      return true;
   }

   async getImage(context: ImageContext, filename: string) {
      if (!isImageContext(context)) {
         throw new ValidationError('Invalid image context');
      }

      const filePath = this.validatePath(context, filename);
      const file = Bun.file(filePath);

      const fileExists = await file.exists();
      if (!fileExists) { throw new NotFoundError('Image not found'); }

      return file;
   }

   async saveImage(context: ImageContext, imageUrl: string, ownerId: string): Promise<ImageType> {

      const tracked = await this.claimImage(imageUrl, ownerId);

      const oldPath = this.validatePath('tempUploads', tracked.filename);
      const newPath = this.validatePath(context, tracked.filename);

      const file = Bun.file(oldPath);
      const buffer = await file.arrayBuffer();
      await Bun.write(newPath, buffer);
      await file.delete();

      tracked.url = `${context}/${tracked.filename}`;
      tracked.status = 'active';

      return {
         filename: tracked.filename,
         url: tracked.url,
         size: tracked.size,
         mimetype: tracked.mimetype,
      };
   }

   async uploadImage(image: File, ownerId: string): Promise<ImageType> {
      // Enforce pending upload limit per user
      const userPending = [...imageStore.values()].filter(
         img => img.ownerId === ownerId && img.status === 'pending'
      );
      if (userPending.length >= MAX_PENDING_PER_USER) {
         throw new ValidationError('Too many pending uploads — attach or discard existing images first');
      }

      let sanitizedBuffer: Buffer;
      try {
         sanitizedBuffer = await new Bun.Image(image)
            .webp({ quality: 85 })
            .toBuffer();
      } catch {
         throw new ValidationError('File must be a valid image');
      }

      const filename = `${randomUUIDv7()}.webp`;
      const filePath = this.validatePath('tempUploads', filename);
      await Bun.write(filePath, sanitizedBuffer);

      const tracked: TrackedImageType = {
         id: randomUUIDv7(),
         filename,
         url: `tempUploads/${filename}`,
         size: sanitizedBuffer.byteLength,
         mimetype: 'image/webp',
         ownerId,
         status: 'pending',
         uploadedAt: new Date(),
      };

      imageStore.set(tracked.id, tracked);
      return {
         filename: tracked.filename,
         url: tracked.url,
         size: tracked.size,
         mimetype: tracked.mimetype
      };
   }

   private validatePath(context: ImageContext, filename: string): string {
      const resolveBase = Bun.resolveSync(`${env.UPLOADS_DIRECTORY}/${context}`, process.cwd());
      const resolvePath = Bun.resolveSync(filename, resolveBase);

      if (!resolvePath.startsWith(resolveBase)) {
         throw new ValidationError('Invalid file path');
      }

      return resolvePath;
   }
}