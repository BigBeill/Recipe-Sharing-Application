import type { Types } from "mongoose"

export type TypeImageReferenceDraft = {
   key: string,
   owner: Types.ObjectId,
   status: "active" | "deleting" | "pending",
}

export type TypeImageReference = TypeImageReferenceDraft & {
   _id: Types.ObjectId,
}