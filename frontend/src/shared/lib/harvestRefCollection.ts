import type { TypeDataHandle } from "../domain/shared.types"
 
/**
 * A single ref to a component that exposes a {@link TypeDataHandle} through `useImperativeHandle`.
 * `current` is `null` until that component mounts.
 *
 * `T` is the type of data the field holds.
 *
 * @example
 * const emailRef = useRef<TypeDataHandle<string>>(null) // a TypeDataRef<string>
 *
 * <TextInput ref={emailRef} />
 */
export type TypeDataRef<T = any> = { current: TypeDataHandle<T> | null }
 
/**
 * A plain object of named {@link TypeDataRef}s, such as all the fields of a form.
 * Every value must be a TypeDataRef, but each one can hold a different data type.
 *
 * The keys become the property names of the harvested data, so name them after
 * the field (`email`) rather than the ref (`emailRef`).
 *
 * Declare it with `satisfies`, not a type annotation. An annotation widens the object
 * to `Record<string, TypeDataRef<any>>`, which loses the key names and data types.
 *
 * @example
 * const refs = {
 *    email: useRef<TypeDataHandle<string>>(null),
 *    age: useRef<TypeDataHandle<number | null>>(null),
 * } satisfies TypeDataRefCollection
 */
export type TypeDataRefCollection = Record<string, TypeDataRef>
 
/** Turns `null` into `undefined` and leaves other types as they are: `string | null` → `string | undefined`. */
type NullToUndefined<T> = T extends null ? undefined : T
 
/**
 * The data returned by {@link harvestRefsObject}: the same keys as the collection,
 * with each ref replaced by the data its `getData()` resolves to.
 * `null` data becomes `undefined`.
 *
 * @example
 * // using the `refs` from the TypeDataRefCollection example
 * type Harvested = TypeDataOfHarvestedCollection<typeof refs>
 * // → { email: string; age: number | undefined }
 */
export type TypeDataOfHarvestedCollection<T extends TypeDataRefCollection> = {
   [K in keyof T]: NullToUndefined<Awaited<ReturnType<NonNullable<T[K]['current']>['getData']>>>
}
 
/**
 * Reads the current data out of every ref in a collection.
 *
 * Calls `getData()` on all refs in parallel and returns the results under the same keys.
 * `null` results come back as `undefined`.
 *
 * @throws If any ref isn't attached (its `current` is `null`, e.g. the component hasn't mounted yet).
 * If any `getData()` rejects, the whole call rejects with that error.
 *
 * @example
 * const data = await harvestRefsObject(refs)
 * // data: { email: string; age: number | undefined }
 */
export default async function harvestRefCollection<T extends TypeDataRefCollection>(refs: T): Promise<TypeDataOfHarvestedCollection<T>> {
   const entries = await Promise.all(
      Object.entries(refs).map(async ([key, ref]) => {
         if (!ref.current) throw new Error(`harvestRefsObject: ref "${key}" is not attached`);
         return [key, (await ref.current.getData()) ?? undefined] as const;
      })
   );
   return Object.fromEntries(entries) as TypeDataOfHarvestedCollection<T>
}
 