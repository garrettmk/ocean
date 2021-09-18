import { MemoryAuthorRepository } from '@/server/interfaces';
import { testAuthorRepository } from '../domain/authors/domain-author-repository-tests';

testAuthorRepository({
  implementationName: 'MemoryAuthorRepository',
  beforeEach: async () => ({
    repository: new MemoryAuthorRepository()
  })
});

