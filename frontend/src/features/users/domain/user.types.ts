import { PackagedImageType } from "@/features/images/domain/image.types";

export interface UserType {
   _id: string;
   name: string;
   email?: string;
   bio?: string;
   image?: PackagedImageType;
   relationship?: RelationshipType;
}

export interface RelationshipType {
   _id: string;
   owner: string;
   target: string;
   type: "none" | "friend" | "requestReceived" | "requestSent" | "self";
}

export interface FolderType {
   _id: string;
   title: string;
   content?: UserType[];
}