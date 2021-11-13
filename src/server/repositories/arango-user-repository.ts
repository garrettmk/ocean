import { Author, AuthorRepository, ID, NotFoundError, AlreadyExistsError } from "@/domain";
import { aql, Database } from "arangojs";
import { CollectionType, DocumentCollection } from "arangojs/collection";
import { Document as ArangoDocument } from 'arangojs/documents';
import { CreateUserInput, UpdateUserInput, User, UserRepository, validateUser, validateCreateUserInput, validateUpdateUserInput, validateUserId } from "../usecases";


type DbUser = {
  id: ID,
  name: string,
  authorId: ID,
}


export type ArangoUserRepoConfig = {
  db: Database,
  collectionNames: {
    users: string,
  }
}

export class ArangoUserRepository implements UserRepository {
  private authors: AuthorRepository;
  private db: Database;

  public collection: DocumentCollection<DbUser>;


  constructor(authors: AuthorRepository, config: ArangoUserRepoConfig) {
    const { db, collectionNames } = config;

    this.authors = authors;
    this.db = db;
    this.collection = db.collection(collectionNames.users);
  }

  
  async initialize() {
    const collectionExists = await this.collection.exists();
    if (!collectionExists)
      await this.collection.create({
        type: CollectionType.DOCUMENT_COLLECTION
      });
  }


  async create(id: ID, input: CreateUserInput) : Promise<User> {
    const existing = await this.getById(id).catch(error => {
      if (error instanceof NotFoundError)
       return null;

      throw error;
    });

    if (existing)
      throw new AlreadyExistsError(`user id ${id}`);
      
    validateCreateUserInput(input);

    const user = await this.db.query(aql`
      INSERT {
        id: ${id},
        name: ${input.name},
        authorId: ${input.author.id}
      } INTO ${this.collection}
      RETURN NEW
    `)
    .then(cursor => cursor.all())
    .then(values => this.fromDocument(values[0], input.author));

    validateUser(user);

    return user;
  }

  
  async getById(id: ID) : Promise<User> {
    validateUserId(id);
    
    const user = await this.db.query(aql`
      RETURN FIRST(
        FOR user IN ${this.collection}
          FILTER user.id == ${id}
          RETURN user
      )
    `)
    .then(cursor => cursor.all())
    .then(([value]) => {
      if (!value)
        throw new NotFoundError(`user id ${id}`);

      return this.fromDocument(value);
    });

    validateUser(user);

    return user;
  }


  async getByAuthorId(id: ID) : Promise<User> {
    const user = await this.db.query(aql`
      RETURN FIRST(
        FOR user IN ${this.collection}
          FILTER user.authorId == ${id}
          RETURN user
      )
    `)
    .then(cursor => cursor.all())
    .then(([value]) => {
      if (!value)
        throw new NotFoundError();

      return this.fromDocument(value);
    });

    validateUser(user);

    return user;
  }


  async update(id: ID, input: UpdateUserInput) : Promise<User> {
    validateUpdateUserInput(input);

    const user = await this.db.query(aql`
      RETURN FIRST(
        FOR user IN ${this.collection}
          FILTER user.id == ${id}
          UPDATE user WITH {
            name: ${input.name}
          } IN ${this.collection}
          RETURN NEW
      )
    `)
    .then(cursor => cursor.all())
    .then(([value]) => {
      if (!value)
        throw new NotFoundError(`user id ${id}`);

      return this.fromDocument(value)
    });

    validateUser(user);

    return user;
  }


  async delete(id: ID) : Promise<User> {
    const user = await this.db.query(aql`
      RETURN FIRST(
        FOR user IN ${this.collection}
          FILTER user.id == ${id}
          REMOVE user IN ${this.collection}
          RETURN OLD
      )
    `)
    .then(cursor => cursor.all())
    .then(([value]) => {
      if (!value)
        throw new NotFoundError(`user id ${id}`);

      return this.fromDocument(value)
    });

    validateUser(user);

    return user;
  }


  private async fromDocument(doc: ArangoDocument<DbUser>, author?: Author) : Promise<User> {
    const { _id, _key, _rev, authorId, ...userFields } = doc;
    const _author = author || await this.authors.getById(authorId);

    return { 
      author: _author,
      ...userFields,
    };
  }
}