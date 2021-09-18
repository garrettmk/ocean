import { validate } from '@/domain';
import { string } from 'superstruct';
import { TextContent } from '../content-types/content-type-text';


const TextContentSchema = string();


export function validateTextContent(value: any) : asserts value is TextContent {
  validate(value, TextContentSchema);
}