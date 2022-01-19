import { Author, AuthorRepository, CreateDocumentInput, Document, DocumentHeader, DocumentMeta, DocumentQuery, DocumentRepository, ID, JSONSerializable, NotFoundError, UpdateDocumentInput, validateCreateDocumentInput, validateDocument, validateDocumentHeader, validateDocumentId, validateDocumentQuery, validateUpdateDocumentInput } from "@/domain";
import { aql, Database } from "arangojs";
import { ArangoError } from "arangojs/error";
import { CollectionType, DocumentCollection } from "arangojs/collection";
import { Document as ArangoDocument } from 'arangojs/documents';


type DbDocument = {
  authorId: ID
  isPublic: boolean
  title: string
  contentType: string
  meta: DocumentMeta
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
        meta: ${'meta' in input ? input.meta : {} }},
        content: ${'content' in input ? input.content : null },
      } INTO ${this.collection}
      RETURN NEW
    `)
    .then(cursor => cursor.all())
    .then(values => this.fromDocument(values[0], author));

    validateDocument(document);

    return document;
  }


  async getById(id: ID) : Promise<Document> {
    validateDocumentId(id);

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


  async query(query: DocumentQuery) : Promise<DocumentHeader[]> {
    validateDocumentQuery(query);

    const filters = [];
    if ('id' in query)
      filters.push(aql`FILTER POSITION(${query.id}, doc._key)`);
    if ('authorId' in query)
      filters.push(aql`FILTER POSITION(${query.authorId}, doc.authorId)`);
    if ('isPublic' in query)
      filters.push(aql`FILTER TO_BOOL(doc.isPublic) == ${Boolean(query.isPublic)}`);
    if ('title' in query)
      filters.push(aql`FILTER ${query.title?.map(keyword => aql`CONTAINS(doc.title, ${keyword})`).reduce((res, cur) => aql`${res} || ${cur}`)}`);
    if ('contentType' in query)
      filters.push(aql`FILTER POSITION(${query.contentType}, doc.contentType)`);

    const allFilters = filters.reduce((res, cur) => aql`${res}${cur}\n`, aql``);

    const documents = await this.db.query(aql`
      FOR doc IN ${this.collection}
        ${allFilters}
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
    validateDocumentId(id);
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
    .then(values => this.fromDocument(values[0]))
    .catch(error => {
      if (error instanceof ArangoError && error.code === 1202)
        throw new NotFoundError(`document id ${id}`);
    });

    validateDocument(document);

    return document;
  }


  async delete(id: ID) : Promise<Document> {
    const document = await this.db.query(aql`
      REMOVE ${id} IN ${this.collection}
      RETURN OLD
    `)
    .then(cursor => cursor.all())
    .then(values => this.fromDocument(values[0]))
    .catch(error => {
      if (error instanceof ArangoError && error.code === 1202)
        throw new NotFoundError(`document id ${id}`);
    });

    validateDocument(document);

    return document;
  }


  public getDatabaseId(id: ID) : ID {
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