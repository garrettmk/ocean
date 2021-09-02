import { Author, AuthorRepository, CreateAuthorInput, ID, NotFoundError, validateAuthor, validateCreateAuthorInput } from "@/domain";
import { aql, Database } from "arangojs";
import { CollectionType, DocumentCollection } from "arangojs/collection";
import { Document as ArangoDocument } from "arangojs/documents";
import { ArangoUtility } from "./arango-utility";


export class ArangoAuthorRepository extends ArangoUtility implements AuthorRepository {
  private collection: DocumentCollection;


  constructor(db: Database, collectionName: string = 'authors') {
    super(db);
    this.collection = this.db.collection(collectionName);
  }


  async initialize() {
    const collectionExists = await this.collection.exists();
    if (collectionExists) return;

    await this.collection.create({
      type: CollectionType.DOCUMENT_COLLECTION
    });
  }


  async create(input: CreateAuthorInput) {
    validateCreateAuthorInput(input);

    const query = aql`
      INSERT {
        name: ${input.name}
      } INTO ${this.collection}
      RETURN NEW
    `;

    const result = await this.db.query(query);
    const arangoAuthor = (await result.all())[0];
    const author = this.fromArangoDocument(arangoAuthor);

    validateAuthor(author);
    return author;
  }


  async getById(id: ID) {
    const arangoId = `${this.collection.name}/${id}`;
    const arangoAuthor = await this.firstOrUndefined(aql`
      RETURN DOCUMENT(${arangoId})
    `);

    if (!arangoAuthor)
      throw new NotFoundError(`author id: ${id}`);

    const author = this.fromArangoDocument(arangoAuthor);
    validateAuthor(author);

    return author;
  }

  
  private fromArangoDocument(doc: ArangoDocument) : Author {
    const { _id, _key, _rev, ...authorFields } = doc;
    return {
      id: _key,
      ...authorFields
    } as Author;
  }
}//