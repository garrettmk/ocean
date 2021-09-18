import { validate } from '@/domain';
import { object, literal, lazy, string, optional, boolean, array, enums, union } from 'superstruct';
import type { SlateContent } from '../content-types';


const TextElementSchema = object({
  text: string(),
  bold: optional(boolean()),
  italic: optional(boolean()),
  underline: optional(boolean()),
  strikethrough: optional(boolean())
});

const ParagraphElementSchema = object({
  type: literal('paragraph'),
  chilren: array(TextElementSchema),
});

const HeadingElementSchema = object({
  type: literal('paragraph'),
  level: enums([1, 2, 3, 4, 5, 6]),
  children: array(TextElementSchema),
});

const LinkElementSchema = object({
  type: literal('link'),
  url: optional(string()),
  children: array(TextElementSchema)
});

const SlateElementSchema = union([
  ParagraphElementSchema,
  HeadingElementSchema,
  LinkElementSchema
]);

const SlateContentSchema = array(SlateElementSchema);


export function validateSlateContent(content: any) : asserts content is SlateContent {
  validate(content, SlateContentSchema);
}