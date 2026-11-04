import { TypeImageReference, TypeSignedImageUrl } from "@/features/images/domain/image.types";

export type TypeUser = {
   _id: string;
   name: string;
   email?: string;
   bio?: string;
   signedImageUrl?: TypeSignedImageUrl;
   relationship?: TypeRelationship | null;
}

export type TypeUserDraft = Omit<TypeUser,
      | '_id'
      | 'relationship'
      | 'signedImageUrl'
   > & {
      imageReference?: TypeImageReference;
   }

export interface TypeRelationship {
   _id: string;
   owner: string;
   target: string;
   type: "friend" | "requestReceived" | "requestSent";
}