import { ArangoAuthorRepository } from "@/server/interfaces";
import { TestArangoDb } from "@/test/__utils__/test-arango-db";
import { testAuthorRepository } from "../domain/authors/domain-author-repository-tests";

let db: TestArangoDb;

testAuthorRepository({
  implementationName: 'ArangoAuthorRepository',

  beforeEach: async () => {
    db = new TestArangoDb();
    await db.initialize();

    const repository = new ArangoAuthorRepository({
      db: db.db!,
      collectionNames: {
        authors: 'authors'
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
  },
})