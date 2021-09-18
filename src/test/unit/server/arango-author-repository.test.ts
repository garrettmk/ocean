import { ArangoAuthorRepository } from "@/server/interfaces";
import { TestArangoDb } from "@/test/__utils__/TestArangoDb";
import { testAuthorRepository } from "../domain/authors/domain-author-repository-tests";


testAuthorRepository({
  implementationName: 'ArangoAuthorRepository',

  beforeAll: async () => new TestArangoDb(),


  beforeEach: async (db) => {
    await db!.emptyCollectionIfExists('authors');

    const repository = new ArangoAuthorRepository({
      db: db!.db,
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