import type { Types } from "mongoose";

export interface TypeUser {
   _id: Types.ObjectId;
   name: string;
   email?: string;
   bio?: string;
   signedImageUrl?: string;
   relationship?: TypeRelationship | null;
}

export interface TypeRelationship {
   _id: Types.ObjectId;
   ownerId: Types.ObjectId;
   targetId: Types.ObjectId;
   type: "friend" | "requestReceived" | "requestSent";
}