import { MemoryAuthorRepository } from '@/server/repositories';
import { testAuthorRepository } from '../domain/authors/domain-author-repository-tests';

testAuthorRepository({
  implementationName: 'MemoryAuthorRepository',
  beforeEach: async () => ({
    repository: new MemoryAuthorRepository()
  }),
  afterEach: async () => {}
});

