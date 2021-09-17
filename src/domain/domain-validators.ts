import { assign, boolean, object, optional, pattern, refine, string, union, unknown, type, array, number, nullable, literal, record, any } from 'superstruct';
import { ID } from './domain-common-types';
import { DocumentLinkMeta } from './domain-link-models';
import { Author, CreateAuthorInput, CreateDocumentInput, Document, DocumentGraph, DocumentHeader, DocumentLink, UpdateDocumentInput } from './domain-models';
import { mimeTypeRegex, validate } from './domain-utils';



// Some common types
const NonEmptyString = refine(string(), 'nonemptystring', value => value.length > 0);
const IDSchema = pattern(string(), /.+/);
const ContentTypeSchema = pattern(string(), mimeTypeRegex);


// Author validation
const AuthorSchema = type({
  id: IDSchema,
  name: NonEmptyString
});

export function validateAuthor(value: any) : asserts value is Author {
  validate(value, AuthorSchema);
}


const CreateAuthorInputSchema = type({
  name: NonEmptyString
});

export function validateCreateAuthorInput(value: any) : asserts value is CreateAuthorInput {
  validate(value, CreateAuthorInputSchema);
}


// Document validation
export function validateDocumentId(value: any) : asserts value is ID {
  validate(value, IDSchema);
}


export function validateContentType(value: any) : asserts value is string {
  validate(value, ContentTypeSchema);
};


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


const DocumentLinkMetaSchema = record(string(), any());

const DocumentLinkSchema = type({
  from: IDSchema,
  to: IDSchema,
  meta: DocumentLinkMetaSchema
});

export function validateDocumentLink(value: any) : asserts value is DocumentLink {
  validate(value, DocumentLinkSchema);
}


export function validateDocumentLinkMeta(value: any) : asserts value is DocumentLinkMeta {
  validate(value, DocumentLinkMetaSchema);
}


const DocumentGraphSchema = type({
  documents: array(DocumentHeaderSchema),
  links: array(DocumentLinkSchema)
});

export function validateDocumentGraph(value: any) : asserts value is DocumentGraph {
  validate(value, DocumentGraphSchema);
}
