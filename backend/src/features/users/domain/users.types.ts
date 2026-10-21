import type { Types } from "mongoose";
import type { TypeImageReference } from "../../images/domain/images.types";


export interface TypeUser {
   _id: Types.ObjectId;
   name: string;
   email?: string;
   bio?: string;
   imageReference?: TypeImageReference;
   relationship?: TypeRelationship | null;
}

export interface TypeRelationship {
   _id: Types.ObjectId;
   ownerId: Types.ObjectId;
   targetId: Types.ObjectId;
   type: "friend" | "requestReceived" | "requestSent";
}