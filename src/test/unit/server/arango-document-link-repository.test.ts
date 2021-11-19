import { ArangoDocumentLinkRepository, ArangoDocumentRepository, MemoryAuthorRepository } from "@/server/repositories";
import { TestArangoDb } from '../../__utils__/test-arango-db';
import { testDocumentLinkRepository } from "../domain/documents/domain-document-link-repository-tests";

let db: TestArangoDb;

testDocumentLinkRepository({
  implementationName: ArangoDocumentRepository.prototype.constructor.name,

  beforeEach: async () => {
    db = new TestArangoDb();
    await db.initialize();

    const authorRepository = new MemoryAuthorRepository();
    const documentRepository = new ArangoDocumentRepository(authorRepository, {
      db: db.db!,
      collectionNames: {
        documents: 'documents'
      }
    });
    
    await documentRepository.initialize();
    
    const repository = new ArangoDocumentLinkRepository(documentRepository, {
      db: db.db!,
      collectionNames: {
        documentLinks: 'documentLinks'
      }
    });
    
    await repository.initialize();
    
    return {
      repository
    }
  },

  afterEach: async () => {
    await db.drop();
    await db.close();
  }
});