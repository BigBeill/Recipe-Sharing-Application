type MongoManagedKeys = '_id' | 'createdAt' | 'updatedAt';

export type DraftOf<TRecord> = Omit<TRecord, MongoManagedKeys>;