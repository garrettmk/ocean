import { Document, DocumentHeader, CreateDocumentInput, UpdateDocumentInput, ID } from '@/domain';


export interface ClientDocumentsGateway {
  listDocuments() : Promise<DocumentHeader[]>,
  getDocument(id: ID) : Promise<Document>,
  createDocument(input: CreateDocumentInput) : Promise<Document>,
  updateDocument(id: ID, input: UpdateDocumentInput) : Promise<Document>,
  deleteDocument(id: ID) : Promise<Document>,
}