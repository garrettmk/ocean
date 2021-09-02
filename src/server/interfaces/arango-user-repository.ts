import { AuthorRepository, ID, NotFoundError } from "@/domain";
import { aql, Database } from "arangojs";
import { DocumentCollection, CollectionType } from "arangojs/collection";
import { Document as ArangoDocument,  } from "arangojs/documents";
import { SaveUserInput, User, UserRepository, validateSaveUserInput, validateUser } from "../usecases";
import { ArangoUtility } from './arango-utility';


type ArangoUserDocument = ArangoDocument<Omit<User, 'author'> & { authorId: ID }>;


export class ArangoUserRepository extends ArangoUtility implements UserRepository {
  private authors: AuthorRepository;
  private collection: DocumentCollection;


  constructor(authors: AuthorRepository, db: Database, collectionName: string = 'users') {
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


  async save(input: SaveUserInput) {
    validateSaveUserInput(input);

    const existing = await this.getById(input.id).catch(error => {
      if (error instanceof NotFoundError)
        return null;
      
      throw error;
    });

    const user = existing 
      ? await this.updateExistingUser(existing, input) 
      : await this.createUser(input);

    validateUser(user);
    return user; 
  }


  async getById(id: ID) {
    const arangoUser = await this.firstOrUndefined(aql`
      FOR user IN ${this.collection}
        FILTER user.id == ${id}
        RETURN user
    `);

    if (!arangoUser)
      throw new NotFoundError(`user id: ${id}`);

    return await this.fromArangoDocument(arangoUser);
  }


  async getByAuthorId(id: ID) {
    const arangoUser = await this.firstOrUndefined(aql`
      FOR user IN ${this.collection}
        FILTER user.authorId == ${id}
        RETURN user
    `);

    if (!arangoUser)
      throw new NotFoundError(`user with authorId: ${id}`);
    
    return await this.fromArangoDocument(arangoUser);
  }


  private async updateExistingUser(existing: User, input: SaveUserInput) : Promise<User> {
    const query = aql`
      FOR user IN ${this.collection}
        FILTER user.id == ${existing.id}
        UPDATE user WITH {
          name: ${input.name}
        } IN ${this.collection}
        RETURN NEW
    `;

    const arangoUser = await this.firstOrUndefined<ArangoUserDocument>(query);
    const user = await this.fromArangoDocument(arangoUser!);

    return user;
  }


  private async createUser(input: SaveUserInput) : Promise<User> {
    const author = await this.authors.create({
      name: input.name
    });
    
    const query = aql`
      INSERT {
        id: ${input.id},
        name: ${input.name},
        authorId: ${author.id}
      } INTO ${this.collection}
      RETURN NEW
    `;

    const arangoUser = await this.firstOrUndefined(query);
    const user = await this.fromArangoDocument(arangoUser);

    return user;
  }
  

  private async fromArangoDocument(doc: ArangoUserDocument) : Promise<User> {
    const { _id, _key, _rev, authorId, ...userFields } = doc;
    const author = await this.authors.getById(authorId);

    return { ...userFields, author };
  }
}