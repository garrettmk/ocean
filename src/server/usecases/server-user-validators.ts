import { ID, validate } from '@/domain';
import { object, pattern, refine, string, type } from 'superstruct';
import { CreateUserInput, UpdateUserInput, User } from './server-user-models';


const NonEmptyString = refine(string(), 'nonemptystring', value => value.length > 0);
const IDSchema = pattern(string(), /.+/);
const AuthorSchema = type({
  id: IDSchema,
  name: NonEmptyString
});


export function validateUserId(value: any) : asserts value is ID {
  validate(value, IDSchema);
}


const UserSchema = object({
  id: IDSchema,
  name: NonEmptyString,
  author: AuthorSchema
});

export function validateUser(value: any) : asserts value is User {
  validate(value, UserSchema);
}


const CreateUserInputSchema = type({
  name: NonEmptyString,
  author: AuthorSchema
});

export function validateCreateUserInput(value: any) : asserts value is CreateUserInput {
  validate(value, CreateUserInputSchema);
}


const UpdateUserInputSchema = type({
  name: NonEmptyString
});

export function validateUpdateUserInput(value: any) : asserts value is UpdateUserInput {
  validate(value, UpdateUserInputSchema);
}