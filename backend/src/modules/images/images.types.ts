export interface ImageType {
   filename: string;
   url: string;
   size: number;
   mimetype: string;
}

export interface TrackedImageType extends ImageType {
   id: string;
   ownerId: string;
   status: 'pending' | 'active';
   uploadedAt: Date;
}