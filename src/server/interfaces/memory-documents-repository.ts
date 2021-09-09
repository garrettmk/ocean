import { Document, CreateDocumentInput, DocumentRepository, ID, UpdateDocumentInput, NotImplementedError, NotFoundError, ValidationError, validateCreateDocumentInput, validateDocument, validateUpdateDocumentInput, DocumentHeader } from "@/domain";
import { AuthorRepository } from "src/domain";


export class MemoryDocumentRepository implements DocumentRepository {
  private authors: AuthorRepository;
  private docs: {
    [key: string]: Document
  };

  private count: number;


  constructor(authors: AuthorRepository) {
    this.authors = authors;
    this.docs = {};
    this.count = 0;
  }


  async create(authorId: ID, input: CreateDocumentInput) {
    validateCreateDocumentInput(input);

    const id = await this._getNextId();
    const author = await this.authors.getById(authorId);

    const doc: Document = {
      id: id + '',
      author,
      isPublic: input.isPublic ?? false,
      title: input.title ?? 'Untitled',
      contentType: 'contentType' in input ? input.contentType : 'text/plain',
      content: 'content' in input ? input.content : null
    };

    validateDocument(doc);

    this.docs[id] = doc;

    return doc;
  }

  async _getNextId() {
    this.count += 1;
    return this.count;
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


  async listById(ids: ID[]) : Promise<DocumentHeader[]> {
    return Object.values(this.docs).filter(doc => ids.includes(doc.id));
  }


  async update(documentId: ID, input: UpdateDocumentInput) {
    validateUpdateDocumentInput(input);

    const doc = this.docs[documentId];
    if (!doc)
      throw new NotFoundError(`document id ${documentId}`);

    const newDoc = { ...doc, ...input };
    validateDocument(newDoc);

    this.docs[documentId] = newDoc;
    return newDoc;
  }


  async delete(documentId: ID) {
    const doc = this.docs[documentId];
    delete this.docs[documentId];
    return doc;
  }
}