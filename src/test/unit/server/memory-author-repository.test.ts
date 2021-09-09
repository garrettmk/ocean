import { MemoryAuthorRepository } from '@/server/interfaces';
import { testAuthorRepository } from '../domain/domain-author-repository-tests';

testAuthorRepository({
  implementationName: 'MemoryAuthorRepository',
  beforeEach: async () => ({
    repository: new MemoryAuthorRepository()
  })
});

