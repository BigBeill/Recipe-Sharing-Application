export interface PackagedImageType {
   filename: string;
   url: string;
   size: number;
   mimetype: string;
   uploadedAt: Date;
}

export interface UnpackedImageType {
   src: string;
   alt: string;
   loading: "lazy" | "eager";
   onError: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}