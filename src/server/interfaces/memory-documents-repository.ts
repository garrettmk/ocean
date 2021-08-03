import { Document, CreateDocumentInput, DocumentRepository, ID, ModifyDocumentInput, NotImplementedError, NotFoundError } from "@/domain";
import { AuthorRepository } from "src/domain";


export class MemoryDocumentRepository implements DocumentRepository {
  private authors: AuthorRepository;
  private docs: {
    [key: string]: Document
  };


  constructor(authors: AuthorRepository) {
    this.authors = authors;
    this.docs = {};
  }


  async create(input: CreateDocumentInput) {
    const id = Object.keys(this.docs).length + 1;
    const author = await this.authors.getById(input.authorId);
    const doc: Document = {
      id: id + '',
      author,
      isPublic: input.isPublic || false,
      title: input.title || 'Untitled',
      contentType: input.contentType || 'text/plain',
      content: input.content ?? ''
    };

    this.docs[id] = doc;

    return doc;
  }


  async getById(documentId: ID) {
    if (!this.docs[documentId])
      throw new NotFoundError(`documentId ${documentId}`);

    return this.docs[documentId];
  }


  async listByAuthor(authorId: ID) {
    return Object.values(this.docs).filter(doc => doc.author.id === authorId);
  }

  
  async listPublic() {
    return Object.values(this.docs).filter(doc => doc.isPublic);
  }


  async modify(documentId: ID, input: ModifyDocumentInput) {
    const doc = this.docs[documentId];
    if (!doc)
      throw new NotFoundError(`document id ${documentId}`);

    const newDoc = { ...doc, ...input };

    // Validate

    this.docs[documentId] = newDoc;
    return newDoc;
  }


  async delete(documentId: ID) {
    delete this.docs[documentId];
    return true;
  }
}