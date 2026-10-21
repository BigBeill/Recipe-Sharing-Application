import { t } from "elysia";
import { Types } from "mongoose";

export const IdValidator = t.Transform(
  t.String({
    pattern: '^[0-9a-fA-F]{24}$',
    error: 'Invalid ObjectId'
  })
)
  .Decode((value) => new Types.ObjectId(value))
  .Encode((value) => value.toString());