export interface TypeImageReference {
   _id: string,
   ownerId: string,
   key: string,
   status: "active" | "deleting" | "pending",
}