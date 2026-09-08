import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const friendRequestSchema = new Schema(
   {
      senderId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
      receiverId: { type: Schema.Types.ObjectId, ref: 'user', required: true }
   }, 
   { timestamps: true }
);

type FriendRequestSchemaType = InferSchemaType<typeof friendRequestSchema>;
export type FriendRequestDocument = HydratedDocument<FriendRequestSchemaType>;
export type FriendRequestRecord = FriendRequestSchemaType & { 
   _id: Types.ObjectId,
   createdAt: Date;
   updatedAt: Date;
};
export const FriendRequestModel = model('FriendRequest', friendRequestSchema);