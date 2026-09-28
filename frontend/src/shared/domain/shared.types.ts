export interface DataHandle<T> {
   getData: () => T;
   setData: (newList: T) => void;
};

// all service functions should return this to force idle handling and preventing slow reactions waiting for API responses
export type ServiceStateType<T> =
   | { status: 'idle' }
   | { status: 'loading' }
   | { status: 'ready'; data: T }
   | { status: 'not-found' }
   | { status: 'error'; error: Error };

export type PaginatedListType<T> = {
   list: T[]; // the list of content itself
   count: number; // the number of items applicable to the category (whether or not they exist inside the current list)
   firstItemIndex: number; // the index of the first item in the list
};

// same thing as a PaginatedListType, but some components of T may be null, (used for combining 2 or more paginatedLists that may or may not line up)
export type BrokenPaginatedListType<T> = {
   list: (T | null)[];
   count: number;
   firstItemIndex: number;
}