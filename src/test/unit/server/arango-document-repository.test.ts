import { ArangoDocumentRepository, MemoryAuthorRepository } from "@/server/interfaces";
import { Database } from "arangojs";
import { testDocumentRepository } from "../domain/domain-document-repository-tests";


testDocumentRepository({
  implementationName: ArangoDocumentRepository.prototype.constructor.name,

  beforeAll: async () => new Database({
    url: 'http://localhost:8529',
    databaseName: 'test'
  }),

  beforeEach: async (db) => {
    const collection = await db!.collection('documents');
    if (await collection.exists()) {
      await collection.truncate();
    }

    const authorRepository = new MemoryAuthorRepository();
    const repository = new ArangoDocumentRepository(authorRepository, {
      db: db!,
      collectionNames: {
        documents: 'documents'
      }
    });

    await repository.initialize();

    return {
      authorRepository,
      repository
    }
  }
});