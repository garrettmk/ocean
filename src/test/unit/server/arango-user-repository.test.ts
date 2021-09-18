import { ArangoUserRepository, MemoryAuthorRepository } from "@/server/interfaces";
import { TestArangoDb } from "@/test/__utils__/TestArangoDb";
import { Database } from "arangojs";
import { testUserRepository } from "./server-user-repository-tests";


testUserRepository({
  implementationName: ArangoUserRepository.prototype.constructor.name,
  
  beforeAll: async () => new TestArangoDb(),

  beforeEach: async (db) => {
    await db?.emptyCollectionIfExists('users');

    const authorRepository = new MemoryAuthorRepository();
    const repository = new ArangoUserRepository(authorRepository, {
      db: db!.db,
      collectionNames: {
        users: 'users'
      }
    });

    await repository.initialize();

    return {
      repository,
      authorRepository
    }
  },
});