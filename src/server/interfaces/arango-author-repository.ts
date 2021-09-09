import { Author, AuthorRepository, CreateAuthorInput, ID, NotFoundError, validateAuthor, validateCreateAuthorInput } from "@/domain";
import { aql, Database } from "arangojs";
import { CollectionType, DocumentCollection } from "arangojs/collection";
import { Document as ArangoDocument } from 'arangojs/documents';


type DbAuthor = {
  name: ID
}


export type ArangoAuthorRepoConfig = {
  db: Database,
  collectionNames: {
    authors: string,
  }
}


export class ArangoAuthorRepository implements AuthorRepository {
  private db: Database;

  public collection: DocumentCollection<DbAuthor>;


  constructor(config: ArangoAuthorRepoConfig) {
    const { db, collectionNames } = config;

    this.db = db;
    this.collection = db.collection(collectionNames.authors);
  }


  async initialize() {
    const collectionExists = await this.collection.exists();
    if (!collectionExists)
      await this.collection.create({
        type: CollectionType.DOCUMENT_COLLECTION
      });
  }


  async create(input: CreateAuthorInput) {
    validateCreateAuthorInput(input);

    const author = await this.db.query(aql`
      INSERT {
        name: ${input.name}
      } INTO ${this.collection}
      RETURN NEW
    `)
    .then(cursor => cursor.all())
    .then(values => values[0])
    .then(doc => this.fromDocument(doc));

    validateAuthor(author);
    
    return author;
  }


  async getById(id: ID) : Promise<Author> {
    const authorId = this.getDatabaseId(id);
    const author = await this.db.query(aql`
      RETURN DOCUMENT(${authorId})
    `)
    .then(cursor => cursor.all())
    .then(([value]) => {
      if (!value)
        throw new NotFoundError(`author id ${id}`);

      return this.fromDocument(value);
    });

    validateAuthor(author);

    return author;
  }


  async listById(ids: ID[]) : Promise<Author[]> {
    const authorIds = ids.map(id => this.getDatabaseId(id));
    const authors = await this.db.query(aql`
      FOR author IN ${this.collection}
        FILTER POSITION(${authorIds}, author._id)
        RETURN author
    `)
    .then(cursor => cursor.all())
    .then(values => values.map(authorDoc =>
      this.fromDocument(authorDoc)
    ));

    const notFoundIds = ids.filter(id => !authors.find(author => author.id === id));
    if (notFoundIds.length)
      throw new NotFoundError(`author ids: ${notFoundIds.join(',')}`);
      
    authors.forEach(validateAuthor);

    return authors;
  }


  public fromDocument(doc: ArangoDocument<DbAuthor>) : Author {
    const { _id, _key, _rev, ...authorFields } = doc;

    return {
      id: _key,
      ...authorFields
    };
  }

  public getDatabaseId(id: ID) : ID {
    return `${this.collection.name}/${id}`;
  }
}