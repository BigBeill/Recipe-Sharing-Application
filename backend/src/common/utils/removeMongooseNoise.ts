import { Types } from 'mongoose';

type MongooseNoise = '__v' | 'createdAt' | 'updatedAt';
type PlainObject = Record<string, unknown>;
type SerializedBuffer = { type: 'Buffer'; data: number[] };

type PassThrough = 'clientSafeMetadata';
type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export type Serialized<T> =
   T extends Primitive ? T :
   T extends (...args: never[]) => unknown ? T :
   T extends Buffer | Types.ObjectId | SerializedBuffer ? string :
   T extends Date ? Date :
   T extends Map<infer K, infer V> ? Record<K & PropertyKey, Serialized<V>> :
   T extends readonly (infer E)[] ? Serialized<E>[] :
   T extends { toObject(): infer O } ? SerializedObject<O> :
   T extends object ? SerializedObject<T> :
   T;

type SerializedObject<T> = {
   [K in keyof T as K extends MongooseNoise ? never : K]:
      K extends PassThrough ? T[K] : Serialized<T[K]>;
};

function isPlainObject(value: unknown): value is PlainObject {
   if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
   const prototype = Object.getPrototypeOf(value);
   return prototype === Object.prototype || prototype === null;
}

function isObjectId(value: unknown): value is Types.ObjectId {
   if (value instanceof Types.ObjectId) return true;
   // duck-type fallback: pnpm can end up with >1 bson copy, breaking instanceof
   const tag = (value as { _bsontype?: string } | null)?._bsontype;
   return tag === 'ObjectId' || tag === 'ObjectID'; // casing changed across bson versions
}

function isSerializedBuffer(value: unknown): value is SerializedBuffer {
   return isPlainObject(value) && value.type === 'Buffer' && Array.isArray(value.data);
}

function isHydratedDocument(value: unknown): value is { toObject: () => PlainObject } {
   return typeof (value as { toObject?: unknown } | null)?.toObject === 'function';
}

function toHexString(value: unknown): string {
   if (Buffer.isBuffer(value)) return value.toString('hex');
   if (isObjectId(value)) return value.toString();          // already hex
   return Buffer.from((value as SerializedBuffer).data).toString('hex');
}

function removeFromList(list: unknown[]): unknown[] {
   return list.map((item) => removeNoise(item));
}

function removeFromObject(obj: PlainObject): PlainObject {
   const { __v, createdAt, updatedAt, ...rest } = obj as Partial<Record<MongooseNoise, unknown>> & PlainObject;
   return Object.fromEntries(
      Object.entries(rest).map(([key, value]) => {
         if (key !== 'clientSafeMetadata') { return [key, removeNoise(value)]; }
         else { return [key, value]; }
      })
   );
}

function removeNoise(value: unknown): unknown {
   if (Buffer.isBuffer(value) || isObjectId(value) || isSerializedBuffer(value)) { return toHexString(value) }
   if (value instanceof Map) { return removeNoise(Object.fromEntries(value)) }
   if (Array.isArray(value)) { return removeFromList(value) }
   if (isHydratedDocument(value)) { return removeFromObject(value.toObject()) }
   if (isPlainObject(value)) { return removeFromObject(value) }
   return value;
}

export default function removeMongooseNoise<T>(value: T): Serialized<T> {
   return removeNoise(value) as Serialized<T>;
}