import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const friendshipSchema = new Schema(
   {
      friendIds: {
         type: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
         validate: [ (value: Schema.Types.ObjectId[]) => { return value.length === 2 }, 'friends must have exactly 2 users' ],
         required: true
      }
   },
   { timestamps: true }
);

type FriendshipSchemaType = InferSchemaType<typeof friendshipSchema>;
export type FriendshipDocument = HydratedDocument<FriendshipSchemaType>;
export type FriendshipRecord = FriendshipSchemaType & { 
   _id: Types.ObjectId,
   createdAt: Date;
   updatedAt: Date;
};
export const FriendshipModel = model('Friendship', friendshipSchema);