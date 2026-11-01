type AnyDataRef = { current: { getData: () => unknown } | null }

type NullToUndefined<T> = T extends null ? undefined : T

export type DataOf<T extends Record<string, AnyDataRef>> = {
   [K in keyof T]: NullToUndefined<Awaited<ReturnType<NonNullable<T[K]['current']>['getData']>>>
}

export default async function harvestRefsObject<T extends Record<string, AnyDataRef>>(refs: T): Promise<DataOf<T>> {
   const entries = await Promise.all(
      Object.entries(refs).map(async ([key, ref]) => [key, (await ref.current!.getData()) ?? undefined] as const),
   )
   return Object.fromEntries(entries) as DataOf<T>
}