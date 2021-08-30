import { Document, DocumentHeader, DocumentRepository, ID } from "@/domain";
import { AuthorizationError } from "./server-errors";
import { UserRepository } from './server-user-models';


export class ServerDocumentInteractor {
  private documents: DocumentRepository;
  private users: UserRepository;


  constructor(documents: DocumentRepository, users: UserRepository) {
    this.documents = documents;
    this.users = users;
  }


  async createDocument(userId: ID, input: CreateDocumentInput) : Promise<Document> {
    const user = await this.users.getById(userId);
    const doc = await this.documents.create(user.author.id, input);

    return doc;
  }


  async listDocuments(userId?: ID) : Promise<DocumentHeader[]> {
    const user = userId && await this.users.getById(userId);
    if (user)
      return await this.documents.listByAuthor(user.author.id);
    else
      return await this.documents.listPublic();
  }


  async updateDocument(userId: ID, documentId: ID, input: UpdateDocumentInput) {
    const user = await this.users.getById(userId);
    const document = await this.documents.getById(documentId);
    const isUpdatePermitted =
      user &&
      document &&
      user.author.id === document.author.id;

    if (!isUpdatePermitted)
      throw new AuthorizationError('Only the document author can make changes');
    
    const newDocument = await this.documents.update(documentId, input);
    return newDocument;
  }


  async getDocument(userId: ID | undefined, documentId: ID) : Promise<Document> {
    const user = userId && await this.users.getById(userId);
    const document = await this.documents.getById(documentId);
    const isViewPermitted = (document.isPublic) || (user && user.author.id === document.author.id);

    if (!isViewPermitted)
      throw new AuthorizationError('Only the document author can view this document');

    return document;
  }


  async deleteDocument(userId: ID, documentId: ID) : Promise<Document> {
    const user = await this.users.getById(userId);
    const document = await this.documents.getById(documentId);
    const isDeletePermitted = document.author.id === user.author.id;

    if (!isDeletePermitted)
      throw new AuthorizationError('Only the document author can delete a document');

    await this.documents.delete(document.id);

    return document;
  }
}


type CreateTitleInput = {
  title?: string,
  isPublic?: boolean
}

type CreateContentInput = {
  contentType: string,
  content: any
}

export type CreateDocumentInput = CreateTitleInput | CreateContentInput | (CreateTitleInput & CreateContentInput);
export type UpdateDocumentInput = CreateTitleInput | CreateContentInput | (CreateTitleInput & CreateContentInput);
