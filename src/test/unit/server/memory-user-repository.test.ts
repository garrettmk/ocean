import { MemoryAuthorRepository, MemoryUserRepository } from '@/server/interfaces';
import { testUserRepository } from './server-user-repository-tests';


testUserRepository({
  implementationName: 'MemoryUserRepository',
  beforeEach: async () => {
    const authorRepository = new MemoryAuthorRepository();
    const repository = new MemoryUserRepository();

    return {
      authorRepository,
      repository
    };
  },
});