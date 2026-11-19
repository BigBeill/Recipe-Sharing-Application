import type { Types } from "mongoose";

export interface TypeRelationship {
   _id: Types.ObjectId;
   ownerId: Types.ObjectId;
   targetId: Types.ObjectId;
   type: "friend" | "requestReceived" | "requestSent";
}