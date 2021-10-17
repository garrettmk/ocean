import { ArangoUserRepository, MemoryAuthorRepository } from "@/server/interfaces";
import { TestArangoDb } from "@/test/__utils__/test-arango-db";
import { Database } from "arangojs";
import { testUserRepository } from "./server-user-repository-tests";


let db: TestArangoDb;

testUserRepository({
  implementationName: ArangoUserRepository.prototype.constructor.name,
  
  beforeEach: async () => {
    db = new TestArangoDb();
    await db.initialize();
    
    const authorRepository = new MemoryAuthorRepository();
    const repository = new ArangoUserRepository(authorRepository, {
      db: db.db!,
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

  afterEach: async () => {
    await db.drop();
    await db.close();
  }
});