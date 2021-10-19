import {
  Document,
  DocumentHeader,
  CreateDocumentInput,
  UpdateDocumentInput,
  ID,
  DocumentLink,
  DocumentLinkMeta,
  DocumentGraph,
  DocumentQuery,
  DocumentGraphQuery,
  JSONSerializable
} from '@/domain';


export interface ClientDocumentsGateway {
  listDocuments(query?: Omit<DocumentQuery, 'authorId'>) : Promise<DocumentHeader[]>,
  getDocument(id: ID) : Promise<Document>,
  createDocument(input: CreateDocumentInput) : Promise<Document>,
  updateDocument(id: ID, input: UpdateDocumentInput) : Promise<Document>,
  deleteDocument(id: ID) : Promise<Document>,
  getRecommendedLinks(id: ID) : Promise<DocumentGraph>,
  linkDocuments(from: ID, to: ID, meta?: DocumentLinkMeta) : Promise<DocumentLink>,
  unlinkDocuments(from: ID, to: ID) : Promise<DocumentLink>,
  importDocumentFromUrl(url: string) : Promise<Document>,
  graphByQuery(query: DocumentGraphQuery) : Promise<DocumentGraph>,
  listContentConversions(from: string) : Promise<string[]>,
  convertContent(content: JSONSerializable, from: string, to: string) : Promise<JSONSerializable>
}