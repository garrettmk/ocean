import { Struct, assert, object, string, pattern, pick, boolean, min, size, assign, unknown, union, optional, StructError, refine } from 'superstruct';
import { ValidationError } from './domain-errors';
import { Document, Author, CreateAuthorInput, CreateDocumentInput, DocumentHeader, UpdateDocumentInput } from './domain-models';


// Transforms StructErrors into ValidationErrors
export function validate(value: any, schema: Struct<any, any>) {
  try {
    assert(value, schema);
  } catch (e) {
    if (e instanceof StructError) {
      const match = e.message.match(/StructError: (.*)/);
      const message = match ? match[1] : e.message;
      throw new ValidationError(message);
    } else {
      throw e;
    }
  }
}

// Some common types
const NonEmptyString = refine(string(), 'nonemptystring', value => value.length > 0);
const IDSchema = pattern(string(), /.+/);
const ContentTypeSchema = pattern(string(), /\w+\/\w+/);


// Author validation
const AuthorSchema = object({
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
const DocumentHeaderSchema = object({
  id: IDSchema,
  author: AuthorSchema,
  isPublic: boolean(),
  title: NonEmptyString,
  contentType: ContentTypeSchema
});

export function validateDocumentHeader(value: any) : asserts value is DocumentHeader {
  validate(value, DocumentHeaderSchema);
}


const DocumentSchema = assign(DocumentHeaderSchema, object({
  content: unknown()
}));

export function validateDocument(value: any) : asserts value is Document {
  validate(value, DocumentSchema);
}


const CreateDocumentInputSchema = union([
  object({
    authorId: IDSchema,
    title: optional(NonEmptyString),
    isPublic: optional(boolean())
  }),

  object({
    authorId: IDSchema,
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