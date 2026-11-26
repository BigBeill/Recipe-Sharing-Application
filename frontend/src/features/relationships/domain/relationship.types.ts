export interface TypeRelationship {
   _id: string;
   ownerId: string;
   targetId: string;
   type: "friend" | "requestReceived" | "requestSent";
}