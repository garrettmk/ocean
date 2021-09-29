import { array, assign, boolean, object, optional, record, string, type, union, unknown } from 'superstruct';
import { DocumentQuery } from '.';
import { AuthorSchema } from '../authors';
import { ContentTypeSchema, ID, IDSchema, JSONSerializableSchema, NonEmptyStringSchema, validate } from "../common";
import { CreateDocumentInput, Document, DocumentGraph, DocumentHeader, DocumentLink, DocumentLinkMeta, UpdateDocumentInput } from './domain-document-models';


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
  title: NonEmptyStringSchema,
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
    title: optional(NonEmptyStringSchema),
    isPublic: optional(boolean())
  }),

  object({
    title: optional(NonEmptyStringSchema),
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
    title: optional(NonEmptyStringSchema),
    isPublic: optional(boolean())
  }),

  object({
    title: optional(NonEmptyStringSchema),
    isPublic: optional(boolean()),
    contentType: ContentTypeSchema,
    content: unknown()
  })
]);

export function validateUpdateDocumentInput(value: any) : asserts value is UpdateDocumentInput {
  validate(value, UpdateDocumentInputSchema);
};


const DocumentQuerySchema = object({
  id: optional(array(IDSchema)),
  authorId: optional(array(IDSchema)),
  isPublic: optional(boolean()),
  title: optional(array(NonEmptyStringSchema)),
  contentType: optional(array(ContentTypeSchema))
});

export function validateDocumentQuery(value: any) : asserts value is DocumentQuery {
  validate(value, DocumentQuerySchema);
}


const DocumentLinkMetaSchema = record(string(), JSONSerializableSchema);

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
