import { type} from 'superstruct';
import { IDSchema, NonEmptyStringSchema, validate } from '../common';
import { Author, CreateAuthorInput } from './domain-author-models';


export const AuthorSchema = type({
  id: IDSchema,
  name: NonEmptyStringSchema
});

export function validateAuthor(value: any) : asserts value is Author {
  validate(value, AuthorSchema);
}


const CreateAuthorInputSchema = type({
  name: NonEmptyStringSchema
});

export function validateCreateAuthorInput(value: any) : asserts value is CreateAuthorInput {
  validate(value, CreateAuthorInputSchema);
}
