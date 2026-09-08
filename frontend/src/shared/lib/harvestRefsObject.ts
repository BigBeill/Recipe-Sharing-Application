type AnyDataRef = { current: { getData: () => unknown } | null }

type NullToUndefined<T> = T extends null ? undefined : T

export type DataOf<T extends Record<string, AnyDataRef>> = {
	[K in keyof T]: NullToUndefined<ReturnType<NonNullable<T[K]['current']>['getData']>>
}

export default function harvestRefsObject<T extends Record<string, AnyDataRef>>(refs: T): DataOf<T> {
	return Object.fromEntries(
		Object.entries(refs).map(([key, ref]) => [key, ref.current!.getData() ?? undefined]),
	) as DataOf<T>
}