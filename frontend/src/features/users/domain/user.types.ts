import { TypeImageReference, TypeSignedImageUrl } from "@/features/images/domain/image.types";
import { TypeRelationship } from "@/features/relationships/domain/relationship.types";

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