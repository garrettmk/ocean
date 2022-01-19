export type JSONSerializablePrimitive = string | number | null | boolean;
export type JSONSerializable = JSONSerializablePrimitive | JSONSerializable[] | { [key: string]: JSONSerializable };

export type ID = string;
export type MetaObject = Record<string, JSONSerializable>