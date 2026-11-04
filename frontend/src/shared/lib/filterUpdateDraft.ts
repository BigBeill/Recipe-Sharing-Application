
/*
   ** filterUpdateDraft(original: Type{ T }, draft: Type{ T }Draft): Partial<Type{ T }Draft>
   *  Function is primarily used for updateAPI endpoints
   *  Takes an original object from the server (for example { TypeRecipe }), and a similar draft object from the client (for example { TypeRecipeDraft })
   *  Returns the draft object, without any fields identical to an existing filed in the original
   *  If no unique fields exist return null
   * 
   ! Some objects have fields in the draft that fall under a different name/structure than the original (imageReference for draft vs signedImageUrl for the complete object). That will not be picked up by this function
*/

export default function filterUpdateDraft<T extends object, O extends T>(original: O, draft: T): Partial<T> | null {
  const result: Partial<T> = {};

  for (const key of Object.keys(draft) as (keyof T)[]) {
    if (!isEqual(original[key], draft[key])) {
      result[key] = draft[key];
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) { return true; }
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) { return false; }
  if (Array.isArray(a) !== Array.isArray(b)) { return false; }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) { return false; }

  return keysA.every((k) =>
    isEqual(
      (a as Record<string, unknown>)[k],
      (b as Record<string, unknown>)[k]
    )
  );
}