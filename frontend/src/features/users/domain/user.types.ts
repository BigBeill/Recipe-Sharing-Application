import { TypeImageReference } from "@/features/images/domain/image.types";

export interface TypeUserDraft {
   name: string;
   email?: string;
   bio?: string;
   imageReference?: TypeImageReference;
}
export interface TypeUser extends TypeUserDraft{
   _id: string;
   relationship?: TypeRelationship | null;
}

export interface TypeRelationship {
   _id: string;
   owner: string;
   target: string;
   type: "friend" | "requestReceived" | "requestSent";
}