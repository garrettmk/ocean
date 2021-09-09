import { testDocumentRepository } from "../domain/domain-document-repository-tests";
import { MemoryAuthorRepository, MemoryDocumentRepository } from "@/server/interfaces";
import { AuthorRepository } from "@/domain";


let authorRepo: AuthorRepository;

testDocumentRepository({
  implementationName: 'MemoryDocumentRepository',
  beforeEach: async () => {
    const authorRepository = new MemoryAuthorRepository();
    const repository = new MemoryDocumentRepository(authorRepository);

    return {
      authorRepository,
      repository
    }
  }
});