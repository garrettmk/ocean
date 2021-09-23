import * as VALID from '@/test/__utils__/domain-valid-examples';
import * as INVALID from '@/test/__utils__/domain-invalid-examples';
import { DocumentLink, DocumentLinkMeta, DocumentLinkRepository, ID, NotFoundError, ValidationError, AlreadyExistsError } from "@/domain";

const optional = (values: any[]) => values.filter(v => v !== undefined);


export type DocumentLinkRepoTestConfig<T extends any> = {
  implementationName: string,
  beforeAll?: () => Promise<T>,
  beforeEach: (t: T) => Promise<{
    repository: DocumentLinkRepository
  }>,
  afterEach?: (t: T) => Promise<void>,
  afterAll?: (t: T) => Promise<void>
}


export function testDocumentLinkRepository<T extends any>({
  implementationName,
  beforeAll: _beforeAll,
  beforeEach: _beforeEach,
  afterEach: _afterEach,
  afterAll: _afterAll,
}: DocumentLinkRepoTestConfig<T>) {
  describe(`Testing DocumentLinkRepository implementation: ${implementationName}`, () => {
    let beforeAllResult: T;
    let repository: DocumentLinkRepository;
    

    beforeAll(async () => {
      if (_beforeAll)
        beforeAllResult = await _beforeAll();
    });


    beforeEach(async () => {
      const result = await _beforeEach(beforeAllResult);
      repository = result.repository;
    });

    afterEach(async () => {
      await _afterEach?.(beforeAllResult);
    });

    afterAll(async () => {
      await _afterAll?.(beforeAllResult);
    });


    describe('Testing link()', () => {
      it.each(VALID.DOCUMENT_LINKS)('should add and return a valid DocumentLink if given valid inputs', async link => {
        expect.assertions(1);
        await expect(repository.link(link.from, link.to, link.meta)).resolves.toMatchObject(link);
      });


      it('should throw AlreadyExistsError if the link already exists', async () => {
        expect.assertions(1);
        const expected = VALID.DOCUMENT_LINKS[0];
        await repository.link(expected.from, expected.to, expected.meta);

        await expect(repository.link(expected.from, expected.to, expected.meta)).rejects.toBeInstanceOf(AlreadyExistsError);
      });


      it.each(INVALID.IDS)('should throw ValidationError if given an invalid from id: %p', async (value) => {
        expect.assertions(1);
        const link = VALID.DOCUMENT_LINKS[0];

        await expect(repository.link(value as any, link.to, link.meta)).rejects.toBeInstanceOf(ValidationError);
      });


      it.each(INVALID.IDS)('should throw ValidationError if given an invalid to id: %p', async (value) => {
        expect.assertions(1);
        const link = VALID.DOCUMENT_LINKS[0];
        
        await expect(repository.link(link.from, value as any, link.meta)).rejects.toBeInstanceOf(ValidationError);
      });


      it.each(optional(INVALID.DOCUMENT_LINK_METAS))('should throw ValidationError if given an invalid meta: %p', async meta => {
        expect.assertions(1);
        const link = VALID.DOCUMENT_LINKS[0];
        
        await expect(repository.link(link.from, link.to, meta)).rejects.toBeInstanceOf(ValidationError);
      });
    });


    describe('Testing unlink()', () => {
      const EXISTING_LINK = VALID.DOCUMENT_LINKS[0];
      const NON_EXISTING_LINK: DocumentLink = {
        from: VALID.IDS[2],
        to: VALID.IDS[3],
        meta: VALID.DOCUMENT_LINK_METAS[0]
      };

      beforeEach(async () => {
        await repository.link(EXISTING_LINK.from, EXISTING_LINK.to, EXISTING_LINK.meta);
      });


      it('should remove the link and return it', async () => {
        expect.assertions(2);
        const received = await repository.unlink(EXISTING_LINK.from, EXISTING_LINK.to);

        expect(received).toMatchObject(EXISTING_LINK);
        await expect(repository.getLink(EXISTING_LINK.from, EXISTING_LINK.to)).rejects.toBeInstanceOf(NotFoundError);
      });


      it('should throw NotFoundError if the link doesn\'t exist', async () => {
        expect.assertions(1);
        await expect(repository.unlink(NON_EXISTING_LINK.from, NON_EXISTING_LINK.to)).rejects.toBeInstanceOf(NotFoundError);
      });


      it.each(INVALID.IDS)('should throw ValidationError if given an invalid from id: %p', async (value) => {
        expect.assertions(1);
        await expect(repository.unlink(value as ID, EXISTING_LINK.to)).rejects.toBeInstanceOf(ValidationError);
      });


      it.each(INVALID.IDS)('should throw ValidationError if given an invalid to id: %p', async (value) => {
        expect.assertions(1);
        await expect(repository.unlink(EXISTING_LINK.from, value as ID)).rejects.toBeInstanceOf(ValidationError);
      });
    });


    describe('Testing getLink', () => {
      const EXISTING_LINK: DocumentLink = {
        from: VALID.IDS[0],
        to: VALID.IDS[1],
        meta: VALID.DOCUMENT_LINK_METAS[0],
      };

      const NON_EXISTING_LINK: DocumentLink = {
        from: VALID.IDS[2],
        to: VALID.IDS[3],
        meta: VALID.DOCUMENT_LINK_METAS[0]
      };

      beforeEach(async () => {
        await repository.link(EXISTING_LINK.from, EXISTING_LINK.to, EXISTING_LINK.meta);
      });


      it('should return a valid DocumentLink if given valid inputs', async () => {
        expect.assertions(1);

        await expect(repository.getLink(EXISTING_LINK.from, EXISTING_LINK.to)).resolves.toMatchObject(EXISTING_LINK);
      });


      it('should throw NotFoundError if the link doesn\'t exist', async () => {
        expect.assertions(1);

        await expect(repository.getLink(NON_EXISTING_LINK.from, NON_EXISTING_LINK.to)).rejects.toBeInstanceOf(NotFoundError);
      });


      it.each(INVALID.IDS)('should throw ValidationError if given an invalid from id: %p', async (value) => {
        expect.assertions(1);

        await expect(repository.getLink(value as ID, EXISTING_LINK.to)).rejects.toBeInstanceOf(ValidationError);
      });


      it.each(INVALID.IDS)('should throw ValidationError if given an invalid to id: %p', async (value) => {
        expect.assertions(1);

        await expect(repository.getLink(EXISTING_LINK.from, value as ID)).rejects.toBeInstanceOf(ValidationError);
      });
    });


    describe('Testing listLinks', () => {
      const EXISTING_LINKS: DocumentLink[] = [
        { from: VALID.IDS[0], to: VALID.IDS[1], meta: VALID.DOCUMENT_LINK_METAS[0] },
        { from: VALID.IDS[0], to: VALID.IDS[2], meta: VALID.DOCUMENT_LINK_METAS[0] },
        { from: VALID.IDS[3], to: VALID.IDS[0], meta: VALID.DOCUMENT_LINK_METAS[0] }
      ];

      beforeEach(async () => {
        await Promise.all(EXISTING_LINKS.map(link => repository.link(link.from, link.to, link.meta)));
      });


      it('should return all links either from or to a given document', async () => {
        expect.assertions(1);

        await expect(repository.listLinks(VALID.IDS[0])).resolves.toMatchObject(EXISTING_LINKS);
      });


      it('should return an empty array if no matching links exist', async () => {
        expect.assertions(1);

        await expect(repository.listLinks(VALID.IDS[4])).resolves.toHaveLength(0);
      });


      it.each(INVALID.IDS)('should throw ValidationError if given an invalid id: %p', async (value) => {
        expect.assertions(1);

        await expect(repository.listLinks(value as ID)).rejects.toBeInstanceOf(ValidationError);
      });
    });


    describe('Testing updateLink()', () => {
      const EXISTING_LINK: DocumentLink = {
        from: VALID.IDS[0],
        to: VALID.IDS[1],
        meta: VALID.DOCUMENT_LINK_METAS[0],
      };

      const NON_EXISTING_LINK: DocumentLink = {
        from: VALID.IDS[2],
        to: VALID.IDS[3],
        meta: VALID.DOCUMENT_LINK_METAS[0]
      };

      beforeEach(async () => {
        await repository.link(EXISTING_LINK.from, EXISTING_LINK.to, EXISTING_LINK.meta);
      });


      it('should update and return the link', async () => {
        expect.assertions(2);
        const expectedMeta = { a: 'b' };
        const expectedLink = { ...EXISTING_LINK, meta: expectedMeta };

        await expect(repository.updateLink(EXISTING_LINK.from, EXISTING_LINK.to, expectedMeta)).resolves.toMatchObject(expectedLink);
        await expect(repository.getLink(EXISTING_LINK.from, EXISTING_LINK.to)).resolves.toMatchObject(expectedLink);
      });


      it('should throw NotFoundError if the link doesn\'t exist', async () => {
        expect.assertions(1);

        await expect(repository.updateLink(NON_EXISTING_LINK.from, NON_EXISTING_LINK.to, {})).rejects.toBeInstanceOf(NotFoundError);
      });


      it.each(INVALID.IDS)('should throw ValidationError if given an invalid from id: %p', async (value) => {
        expect.assertions(1);

        await expect(repository.updateLink(value as ID, EXISTING_LINK.to, VALID.DOCUMENT_LINK_METAS[0])).rejects.toBeInstanceOf(ValidationError);
      });


      it.each(INVALID.IDS)('should throw ValidationError if given an invalid to id: %p', async (value) => {
        expect.assertions(1);

        await expect(repository.updateLink(EXISTING_LINK.from, value as ID, VALID.DOCUMENT_LINK_METAS[0])).rejects.toBeInstanceOf(ValidationError);
      });


      it.each(INVALID.DOCUMENT_LINK_METAS)('should throw ValidationError if given an invalid meta: %p', async (value) => {
        expect.assertions(1);

        await expect(repository.updateLink(EXISTING_LINK.from, EXISTING_LINK.to, value as unknown as DocumentLinkMeta)).rejects.toBeInstanceOf(ValidationError);
      });      
    });
  });
}