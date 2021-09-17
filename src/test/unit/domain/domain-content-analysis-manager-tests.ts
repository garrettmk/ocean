import { ContentAnalysisManager, NotFoundError, ValidationError } from "@/domain";
import { AlreadyExistsError } from "@/server/usecases";
import * as INVALID from '../../__utils__/domain-content-invalid-examples';
import * as VALID from '../../__utils__/domain-content-valid-examples';


export type ContentMigrationManagerTestConfig<T extends any> = {
  implementationName: string,
  beforeAll?: () => Promise<T>,
  beforeEach: (t: T) => Promise<{
    manager: ContentAnalysisManager
  }>,
  afterEach?: (t: T) => Promise<void>,
  afterAll?: (t: T) => Promise<void>
}


export function testContentAnalysisManager<T extends any>({
  implementationName,
  beforeAll: _beforeAll,
  beforeEach: _beforeEach,
  afterEach: _afterEach,
  afterAll: _afterAll
}: ContentMigrationManagerTestConfig<T>) {
  describe(`Testing ${implementationName}`, () => {
    let beforeAllResult: T;
    let manager: ContentAnalysisManager;
  
    beforeAll(async () => {
      if (_beforeAll)
        beforeAllResult = await _beforeAll();
    });
  
    beforeEach(async () => {
      const result = await _beforeEach(beforeAllResult);
      manager = result.manager;
    });
  
    afterEach(async () => {
      _afterEach?.(beforeAllResult);
    });
  
    afterAll(async () => {
      _afterAll?.(beforeAllResult);
    });


    describe('Testing registerAnalyzer()', () => {
      it.each(VALID.CONTENT_ANALYZERS)('should resolve to true when registering a new migration %p', async value => {
        expect.assertions(1);
        await expect(manager.registerAnalyzer(value)).resolves.toBe(true);
      });

      it('should throw AlreadyExistsError if a matching analyzer has already been registered', async () => {
        expect.assertions(2);

        await expect(manager.registerAnalyzer(VALID.CONTENT_ANALYZERS[0])).resolves.toBe(true)
        await expect(manager.registerAnalyzer(VALID.CONTENT_ANALYZERS[0])).rejects.toBeInstanceOf(AlreadyExistsError);
      });

      it.each(INVALID.CONTENT_ANALYZERS)('should throw ValidationError if given an invalid analyzer %p', async value => {
        expect.assertions(1);

        await expect(manager.registerAnalyzer(value)).rejects.toBeInstanceOf(ValidationError);
      });
    });


    describe('Testing listAllAnalyzers()', () => {
      it('should return all registered analyzers', async () => {
        expect.assertions(1);
        await Promise.all(VALID.CONTENT_ANALYZERS.map(analyzer => manager.registerAnalyzer(analyzer)));

        await expect(manager.listAllAnalyzers()).resolves.toEqual(expect.arrayContaining(VALID.CONTENT_ANALYZERS));
      });

      it('should return an empty array if no analyzers have been registered', async () => {
        expect.assertions(1);
        await expect(manager.listAllAnalyzers()).resolves.toHaveLength(0);
      });
    });


    describe('Testing getAnalyzer()', () => {
      beforeEach(async () => {
        await Promise.all(VALID.CONTENT_ANALYZERS.map(analyzer => manager.registerAnalyzer(analyzer)));
      });

      it.each(VALID.CONTENT_ANALYZERS)('should return the analyzer registered for the given content type', async analyzer => {
        expect.assertions(1);
        await expect(manager.getAnalyzer(analyzer.contentTypes[0])).resolves.toBe(analyzer);
      });

      it('should throw NotFoundError if no analyzer has been registered for the given content type', async () => {
        expect.assertions(1);
        await expect(manager.getAnalyzer('some/contenttype')).rejects.toBeInstanceOf(NotFoundError);
      });

      it.each(INVALID.CONTENT_TYPES)('should throw ValidationError if given an invalid content type %p', async value => {
        expect.assertions(1);
        await expect(manager.getAnalyzer(value)).rejects.toBeInstanceOf(ValidationError);
      });
    });


    describe('Testing analyze()', () => {
      beforeEach(async () => {
        await Promise.all(VALID.CONTENT_ANALYZERS.map(analyzer => manager.registerAnalyzer(analyzer)));
      });

      it.each(VALID.CONTENT_ANALYZERS)('should invoke the analyzer for the given content type and return its result', async analyzer => {
        expect.assertions(3);
        const contentType = analyzer.contentTypes[0];
        const content = 'some content';

        const result = await manager.analyze(contentType, content);

        expect(analyzer.analyze).toHaveBeenCalled();
        expect((analyzer.analyze as jest.Mock).mock.calls[0]).toMatchObject([contentType, content]);
        expect(result).toBe((analyzer.analyze as jest.Mock).mock.results[0].value);
      });

      it('should throw NotFoundError if no analyzer has been registered for the given content type', async () => {
        expect.assertions(1);
        await expect(manager.analyze('some/content', 'anything')).rejects.toBeInstanceOf(NotFoundError);
      });

      it.each(INVALID.CONTENT_TYPES)('should throw ValidationError if given an invalid content type %p', async value => {
        expect.assertions(1);
        await expect(manager.analyze(value, 'anything')).rejects.toBeInstanceOf(ValidationError);
      });
    });
  });
}