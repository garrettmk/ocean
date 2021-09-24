import { Document, DocumentHeader, CreateDocumentInput, UpdateDocumentInput, ID, DocumentLink, DocumentLinkMeta, DocumentGraph } from '@/domain';


export interface ClientDocumentsGateway {
  listDocuments() : Promise<DocumentHeader[]>,
  getDocument(id: ID) : Promise<Document>,
  createDocument(input: CreateDocumentInput) : Promise<Document>,
  updateDocument(id: ID, input: UpdateDocumentInput) : Promise<Document>,
  deleteDocument(id: ID) : Promise<Document>,
  getRecommendedLinks(id: ID) : Promise<DocumentGraph>,
  linkDocuments(from: ID, to: ID, meta?: DocumentLinkMeta) : Promise<DocumentLink>,
  unlinkDocuments(from: ID, to: ID) : Promise<DocumentLink>,
  importDocumentFromUrl(url: string) : Promise<Document>,
  getDocumentGraph(id: ID, depth?: number) : Promise<DocumentGraph>,
}