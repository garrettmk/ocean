import { ArangoAuthorRepository } from "@/server/interfaces";
import { Database } from "arangojs";
import { testAuthorRepository } from "../domain/domain-author-repository-tests";


testAuthorRepository({
  implementationName: 'ArangoAuthorRepository',

  beforeAll: async () => new Database({
    url: 'http://localhost:8529',
    databaseName: 'test'
  }),


  beforeEach: async (db) => {
    const collection = await db!.collection('authors');
    if (await collection.exists()) {
      await collection.truncate();
    }

    const repository = new ArangoAuthorRepository({
      db: db!,
      collectionNames: {
        authors: 'authors'
      }
    });

    await repository.initialize();

    return {
      repository
    }
  }
})