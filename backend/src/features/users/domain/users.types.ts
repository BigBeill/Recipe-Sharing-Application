import type { Types } from "mongoose";
import type { TypeRelationship } from "../../relationships/domain/relationships.types";

export interface TypeUser {
   _id: Types.ObjectId;
   name: string;
   email?: string;
   bio?: string;
   signedImageUrl?: string;
   relationship?: TypeRelationship | null;
}


export interface TypeUserDraft {
   name: string;
   email: string;
   passwordHash: string;
}