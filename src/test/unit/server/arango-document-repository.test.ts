import { ArangoDocumentRepository, MemoryAuthorRepository } from "@/server/interfaces";
import { TestArangoDb } from "@/test/__utils__/TestArangoDb";
import { testDocumentRepository } from "../domain/domain-document-repository-tests";


testDocumentRepository({
  implementationName: ArangoDocumentRepository.prototype.constructor.name,

  beforeAll: async () => new TestArangoDb(),

  beforeEach: async (db) => {
    const authorRepository = new MemoryAuthorRepository();
    const repository = new ArangoDocumentRepository(authorRepository, {
      db: db!.db,
      collectionNames: {
        documents: 'documents'
      }
    });

    await repository.initialize();

    return {
      authorRepository,
      repository
    }
  },

  afterEach: async (db) => {
    await db!.emptyCollectionIfExists('documents');
  }
});