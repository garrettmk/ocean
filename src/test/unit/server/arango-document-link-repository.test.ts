import { ArangoDocumentLinkRepository, ArangoDocumentRepository, MemoryAuthorRepository } from "@/server/interfaces";
import { TestArangoDb } from '../../__utils__/TestArangoDb';
import { testDocumentLinkRepository } from "../domain/domain-document-link-repository-tests";


testDocumentLinkRepository({
  implementationName: ArangoDocumentRepository.prototype.constructor.name,

  beforeAll: async () => new TestArangoDb(),

  beforeEach: async (db) => {
    const authorRepository = new MemoryAuthorRepository();
    const documentRepository = new ArangoDocumentRepository(authorRepository, {
      db: db!.db,
      collectionNames: {
        documents: 'documents'
      }
    });
    
    await documentRepository.initialize();
    
    const repository = new ArangoDocumentLinkRepository(documentRepository, {
      db: db!.db,
      collectionNames: {
        documentLinks: 'documentLinks'
      }
    });
    
    await repository.initialize();
    
    return {
      repository
    }
  },

  afterEach: async (db) => {
    await db.emptyCollectionIfExists('documents');
    await db.emptyCollectionIfExists('documentLinks');
  }
});