import { ArangoDocumentRepository, MemoryAuthorRepository } from "@/server/interfaces";
import { TestArangoDb } from "@/test/__utils__/test-arango-db";
import { testDocumentRepository } from "../domain/documents/domain-document-repository-tests";

let db: TestArangoDb;

testDocumentRepository({
  implementationName: ArangoDocumentRepository.prototype.constructor.name,

  beforeEach: async () => {
    db = new TestArangoDb();
    await db.initialize();

    const authorRepository = new MemoryAuthorRepository();
    const repository = new ArangoDocumentRepository(authorRepository, {
      db: db.db!,
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

  afterEach: async () => {
    await db.drop();
    await db.close();
  }
});