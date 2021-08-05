import { validate } from '@/domain/domain-utils';
import { Struct, string, pattern, size, object, refine } from 'superstruct';
import { SaveUserInput, User } from './server-user-models';


const NonEmptyString = refine(string(), 'nonemptystring', value => value.length > 0);
const IDSchema = pattern(string(), /.+/);


const UserSchema = object({
  id: IDSchema,
  name: NonEmptyString,
  author: object({
    id: IDSchema,
    name: NonEmptyString
  })
});

export function validateUser(value: any) : asserts value is User {
  validate(value, UserSchema);
}


const SaveUserInputSchema = object({
  id: IDSchema,
  name: NonEmptyString
});

export function validateSaveUserInput(value: any) : asserts value is SaveUserInput {
  validate(value, SaveUserInputSchema);
}