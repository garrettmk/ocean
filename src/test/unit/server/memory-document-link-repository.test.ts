import { MemoryDocumentLinkRepository } from "@/server/interfaces";
import { testDocumentLinkRepository } from "../domain/documents/domain-document-link-repository-tests";


testDocumentLinkRepository({
  implementationName: MemoryDocumentLinkRepository.prototype.constructor.name,

  beforeEach: async (db) => {
    const repository = new MemoryDocumentLinkRepository();

    return {
      repository
    }
  },
});