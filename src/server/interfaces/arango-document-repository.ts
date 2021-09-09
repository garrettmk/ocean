import { Author, AuthorRepository, CreateDocumentInput, Document, DocumentHeader, DocumentRepository, ID, NotFoundError, UpdateDocumentInput, validateCreateDocumentInput, validateDocument, validateDocumentHeader, validateUpdateDocumentInput } from "@/domain";
import { aql, Database } from "arangojs";
import { CollectionType, DocumentCollection } from "arangojs/collection";
import { Document as ArangoDocument } from 'arangojs/documents';


type DbDocument = {
  authorId: ID,
  isPublic: boolean,
  title: string,
  contentType: string,
  content: any
}


export type ArangoDocumentRepoConfig = {
  db: Database,
  collectionNames: {
    documents: string,
  }
}


export class ArangoDocumentRepository implements DocumentRepository {
  private authors: AuthorRepository;
  private db: Database;
  private collection: DocumentCollection<DbDocument>;

  constructor(authors: AuthorRepository, config: ArangoDocumentRepoConfig) {
    const { db, collectionNames } = config;

    this.authors = authors;
    this.db = db;
    this.collection = db.collection(collectionNames.documents);
  }


  async initialize() {
    const collectionExists = await this.collection.exists();
    if (!collectionExists)
      await this.collection.create({
        type: CollectionType.DOCUMENT_COLLECTION
      });
  }


  async create(authorId: ID, input: CreateDocumentInput) : Promise<Document> {
    validateCreateDocumentInput(input);

    const author = await this.authors.getById(authorId);
    const document = await this.db.query(aql`
      INSERT {
        authorId: ${authorId},
        isPublic: ${input.isPublic ?? false},
        title: ${input.title ?? 'Untitled' },
        contentType: ${'contentType' in input ? input.contentType : 'text/plain' },
        content: ${'content' in input ? input.content : null }
      } INTO ${this.collection}
      RETURN NEW
    `)
    .then(cursor => cursor.all())
    .then(values => this.fromDocument(values[0], author));

    validateDocument(document);

    return document;
  }


  async getById(id: ID) : Promise<Document> {
    const documentId = this.getDatabaseId(id);
    const document = await this.db.query(aql`
      RETURN DOCUMENT(${documentId})
    `)
    .then(cursor => cursor.all())
    .then(([value]) => {
      if (!value)
        throw new NotFoundError(`document id ${id}`);

      return this.fromDocument(value);
    });

    validateDocument(document);

    return document;
  }


  async listByAuthor(authorId: ID) : Promise<DocumentHeader[]> {
    const author = await this.authors.getById(authorId);
    const documents = await this.db.query(aql`
      FOR doc IN ${this.collection}
        FILTER doc.authorId == ${authorId}
        RETURN UNSET(doc, 'content')
    `)
    .then(cursor => cursor.all())
    .then(values => values.map(async value => {
      const doc = await this.fromDocument(value, author);
      validateDocument(doc);
      return doc;
    }));

    return Promise.all(documents);
  }


  async listPublic() : Promise<DocumentHeader[]> {
    const documents = await this.db.query(aql`
      FOR doc IN ${this.collection}
        FILTER doc.isPublic
        RETURN UNSET(doc, 'content')
    `)
    .then(cursor => cursor.all())
    .then(values => values.map(async value => {
      const doc = await this.fromDocument(value);
      validateDocumentHeader(doc);
      return doc;
    }));

    return Promise.all(documents);
  }


  async listById(ids: ID[]) : Promise<DocumentHeader[]> {
    const documentIds = ids.map(id => this.getDatabaseId(id));
    const documents = await this.db.query(aql`
      FOR doc IN ${this.collection}
        FILTER POSITION(${documentIds}, doc.id)
        RETURN UNSET(doc, 'content')
    `)
    .then(cursor => cursor.all())
    .then(values => values.map(async value => {
      const doc = await this.fromDocument(value);
      validateDocumentHeader(doc);
      return doc;
    }));

    return Promise.all(documents);
  }


  async update(id: ID, input: UpdateDocumentInput) : Promise<Document> {
    validateUpdateDocumentInput(input);

    const updates = Object.entries(input)
    .reduce((res, [key, value]) => aql`${res}${key}: ${value},\n`, aql``);

    const document = await this.db.query(aql`
      UPDATE ${id} WITH {
        ${updates}
      } IN ${this.collection}
      RETURN NEW
    `)
    .then(cursor => cursor.all())
    .then(values => this.fromDocument(values[0]));

    validateDocument(document);

    return document;
  }


  async delete(id: ID) : Promise<Document> {
    const document = await this.db.query(aql`
      REMOVE ${id} IN ${this.collection}
      RETURN OLD
    `)
    .then(cursor => cursor.all())
    .then(values => this.fromDocument(values[0]));

    validateDocument(document);

    return document;
  }


  private getDatabaseId(id: ID) : ID {
    return `${this.collection.name}/${id}`;
  }


  private async fromDocument(doc: ArangoDocument<DbDocument>, author?: Author) : Promise<Document> {
    const { _id, _key, _rev, authorId, ...documentFields } = doc;

    return {
      id: _key,
      author: author ?? await this.authors.getById(authorId),
      ...documentFields
    };
  }
}