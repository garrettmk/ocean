import { assign, boolean, object, optional, pattern, refine, string, union, unknown, type } from 'superstruct';
import { Author, CreateAuthorInput, CreateDocumentInput, Document, DocumentHeader, UpdateDocumentInput } from './domain-models';
import { validate } from './domain-utils';



// Some common types
const NonEmptyString = refine(string(), 'nonemptystring', value => value.length > 0);
const IDSchema = pattern(string(), /.+/);
const ContentTypeSchema = pattern(string(), /\w+\/\w+/);


// Author validation
const AuthorSchema = type({
  id: IDSchema,
  name: NonEmptyString
});

export function validateAuthor(value: any) : asserts value is Author {
  validate(value, AuthorSchema);
}


const CreateAuthorInputSchema = object({
  name: NonEmptyString
});

export function validateCreateAuthorInput(value: any) : asserts value is CreateAuthorInput {
  validate(value, CreateAuthorInputSchema);
}


// Document validation
const DocumentHeaderSchema = type({
  id: IDSchema,
  author: AuthorSchema,
  isPublic: boolean(),
  title: NonEmptyString,
  contentType: ContentTypeSchema
});

export function validateDocumentHeader(value: any) : asserts value is DocumentHeader {
  validate(value, DocumentHeaderSchema);
}


const DocumentSchema = assign(DocumentHeaderSchema, type({
  content: unknown()
}));

export function validateDocument(value: any) : asserts value is Document {
  validate(value, DocumentSchema);
}


const CreateDocumentInputSchema = union([
  object({
    title: optional(NonEmptyString),
    isPublic: optional(boolean())
  }),

  object({
    title: optional(NonEmptyString),
    isPublic: optional(boolean()),
    contentType: ContentTypeSchema,
    content: unknown(),
  })
]);

export function validateCreateDocumentInput(value: any) : asserts value is CreateDocumentInput {
  validate(value, CreateDocumentInputSchema);
}


const UpdateDocumentInputSchema = union([
  object({
    title: optional(NonEmptyString),
    isPublic: optional(boolean())
  }),

  object({
    title: optional(NonEmptyString),
    isPublic: optional(boolean()),
    contentType: ContentTypeSchema,
    content: unknown()
  })
]);

export function validateUpdateDocumentInput(value: any) : asserts value is UpdateDocumentInput {
  validate(value, UpdateDocumentInputSchema);
};