import { AuthorRepository, CreateDocumentInput, Document, DocumentRepository, ID, NotFoundError, UpdateDocumentInput, validateCreateDocumentInput, validateDocument, validateUpdateDocumentInput } from "@/domain";
import { aql, Database } from "arangojs";
import { CollectionType, DocumentCollection } from "arangojs/collection";
import { Document as ArangoDocument } from "arangojs/documents";
import { ArangoUtility } from './arango-utility';


type ArangoDocumentDoc = ArangoDocument<Omit<Document, 'id' | 'author'> & {
  authorId: ID
}>;


export class ArangoDocumentRepository extends ArangoUtility implements DocumentRepository {
  private authors: AuthorRepository;
  private collection: DocumentCollection<ArangoDocumentDoc>;


  constructor(authors: AuthorRepository, db: Database, collectionName: string = 'documents') {
    super(db);
    this.authors = authors;
    this.collection = db.collection(collectionName);
  }


  async initialize() {
    const collectionExists = await this.collection.exists();
    if (collectionExists) return;

    await this.collection.create({
      type: CollectionType.DOCUMENT_COLLECTION
    });
  }


  async create(authorId: ID, input: CreateDocumentInput) {
    validateCreateDocumentInput(input);

    const arangoDocument = await this.firstOrUndefined<ArangoDocumentDoc>(aql`
      INSERT {
        authorId: ${authorId},
        isPublic: ${input.isPublic ?? false},
        title: ${input.title ?? 'Untitled' },
        contentType: ${'contentType' in input ? input.contentType : 'text/plain' },
        content: ${'content' in input ? input.content : '' }
      } INTO ${this.collection}
      RETURN NEW
    `);

    const document = await this.fromArangoDocument(arangoDocument!);
    validateDocument(document);

    return document;
  }


  async getById(id: ID) {
    const arangoId = `${this.collection.name}/${id}`;
    const arangoDoc = await this.firstOrUndefined(aql`
      RETURN DOCUMENT(${arangoId})
    `);

    if (!arangoDoc)
      throw new NotFoundError(`document id: ${id}`);

    return await this.fromArangoDocument(arangoDoc);
  }


  async listByAuthor(id: ID) {
    const results = await this.db.query(aql`
      FOR doc IN ${this.collection}
        FILTER doc.authorId == ${id}
        RETURN doc
    `).then(cursor => cursor.all());

    return Promise.all(results.map(doc => this.fromArangoDocument(doc)));
  }


  async listPublic() {
    const results = await this.db.query(aql`
      FOR doc IN ${this.collection}
        FILTER doc.isPublic == true
        RETURN doc
    `).then(cursor => cursor.all());

    return Promise.all(results.map(doc => this.fromArangoDocument(doc)));
  }


  async update(id: ID, input: UpdateDocumentInput) {
    validateUpdateDocumentInput(input);

    const updates = Object.entries(input).reduce((res, [key, value]) => 
      res + `${key}: ${value}\n`, ''
    );

    const arangoDoc = await this.firstOrUndefined(aql`
      UPDATE ${id} WITH {
        ${aql.literal(updates)}
      } IN ${this.collection}
      RETURN NEW
    `);

    return await this.fromArangoDocument(arangoDoc);
  }


  async delete(id: ID) {
    const deleted = await this.firstOrUndefined(aql`
      REMOVE ${id} IN ${this.collection}
      RETURN OLD
    `);

    return !!deleted;
  }


  private async fromArangoDocument(doc: ArangoDocumentDoc) : Promise<Document> {
    const { _id, _key, _rev, authorId, ...docFields } = doc;
    const author = await this.authors.getById(authorId);

    return {
      id: _key,
      author,
      ...docFields
    };
  }
}