import { Author, Document, DocumentHeader, DocumentRepository, ID } from "@/domain";
import { User, UserRepository } from './server-user-models';


export class ServerDocumentInteractor {
  private documents: DocumentRepository;
  private users: UserRepository;


  constructor(documents: DocumentRepository, users: UserRepository) {
    this.documents = documents;
    this.users = users;
  }


  async createDocument(userId: ID, input: CreateDocumentInput) : Promise<Document> {
    const user = await this.users.getById(userId);
    const doc = await this.documents.create({
      authorId: user.author.id,
      ...input
    });

    return doc;
  }


  async listDocuments(userId?: ID) : Promise<DocumentHeader[]> {
    const user = userId && await this.users.getById(userId);
    if (user)
      return await this.documents.listByAuthor(user.author.id);
    else
      return await this.documents.listPublic();
  }
}


export type CreateDocumentInput = {
  title?: string,
  contentType?: string,
  content?: any
}