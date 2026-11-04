import type { Types } from "mongoose";

export type TypePaginatedList<T> = {
   list: T[];
   count: number;
   firstItemIndex: number;
};

export type TypeAuthId = {
   authId?: Types.ObjectId; // ? No function should assume authId was provided. Any reference to it should assume undefined is possible
}