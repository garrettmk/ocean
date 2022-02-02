import { Source } from '@/client/utils';
import {
  CreateDocumentInput,
  Document,
  DocumentGraph,
  DocumentGraphQuery,
  DocumentHeader,
  DocumentLink,
  DocumentLinkMeta,
  DocumentQuery,
  ID,
  JSONSerializable,
  UpdateDocumentInput
} from '@/domain';


export interface ClientDocumentsGateway {
  listDocuments(query?: Omit<DocumentQuery, 'authorId'>): Source<DocumentHeader[]>,
  getDocument(id: ID): Source<Document>,
  getDocumentHeader(id: ID): Source<DocumentHeader>,
  createDocument(input: CreateDocumentInput): Source<Document>,
  updateDocument(id: ID, input: UpdateDocumentInput): Source<Document>,
  deleteDocument(id: ID): Source<Document>,
  getRecommendedLinks(id: ID): Source<DocumentGraph>,
  linkDocuments(from: ID, to: ID, meta?: DocumentLinkMeta): Source<DocumentLink>,
  unlinkDocuments(from: ID, to: ID): Source<DocumentLink>,
  importDocumentFromUrl(url: string): Source<Document>,
  graphByQuery(query: DocumentGraphQuery): Source<DocumentGraph>,
  listContentConversions(from: string): Source<string[]>,
  convertContent(content: JSONSerializable, from: string, to: string): Source<JSONSerializable>,
}