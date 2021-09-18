import { array, boolean, Describe, lazy, literal, number, pattern, record, refine, string, union } from 'superstruct';
import { JSONSerializable } from './domain-common-types';
import { mimeTypeRegex, validate } from './domain-common-utils';


export const NonEmptyStringSchema = refine(string(), 'nonemptystring', value => value?.length > 0);
export const IDSchema = pattern(string(), /.+/);
export const ContentTypeSchema = pattern(string(), mimeTypeRegex);
export const JSONPrimitiveSchema = union([string(), number(), literal(null), boolean()]);
export const JSONSerializableSchema: Describe<JSONSerializable> = union([
  JSONPrimitiveSchema,
  array(lazy(() => JSONSerializableSchema)),
  record(string(), lazy(() => JSONSerializableSchema))
]);

export function validateJSONSerializable(value: any) : asserts value is JSONSerializable {
  validate(value, JSONSerializableSchema);
}