import { ArangoUserRepository, MemoryAuthorRepository } from "@/server/interfaces";
import { Database } from "arangojs";
import { testUserRepository } from "./server-user-repository-tests";


testUserRepository({
  implementationName: ArangoUserRepository.prototype.constructor.name,
  
  beforeAll: async () => new Database({
    url: 'http://localhost:8529',
    databaseName: 'test'
  }),

  beforeEach: async (db) => {
    const collection = await db!.collection('users');
    if (await collection.exists()) {
      await collection.truncate();
    }

    const authorRepository = new MemoryAuthorRepository();
    const repository = new ArangoUserRepository(authorRepository, {
      db: db!,
      collectionNames: {
        users: 'users'
      }
    });

    await repository.initialize();

    return {
      repository,
      authorRepository
    }
  }
});