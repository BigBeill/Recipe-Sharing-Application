import { t } from "elysia";
import { UserValidator } from "./user.validator";

export const UpdateValidator = t.Composite([
   t.Pick(UserValidator, ["_id"]),
   t.Partial(t.Omit(UserValidator, ["_id"])),
]);