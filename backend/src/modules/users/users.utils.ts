import type { UserRecord } from "../../common/mongo-db/schemas/user.schema";
import { joinWithOxfordComma } from "../../common/utils/joinWithOxfordComma";
import type { UserType } from "./users.types";

export function buildConflictString(userA: UserType, userBList: UserType[] | UserRecord[]): string | null {
   const conflictList = new Set<string>();

   userBList.forEach((userB) => {
      if (userA.name === userA.name) { conflictList.add("name"); }
      if (userA.email === userB.email) { conflictList.add("email"); }
   });

   if (conflictList.size === 0) { return null; }
   else { return `Conflict with other users found: ${joinWithOxfordComma([...conflictList])}`; }
}