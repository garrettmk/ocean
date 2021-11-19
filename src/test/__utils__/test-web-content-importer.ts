import { ContentImporter, ImportedWebContent } from "@/server/content-loaders/web-content-importer";
import { TestPromise } from './test-promise';


// type Mock<T> = ReturnType<(typeof jest.fn)<T>>;
interface MockWebContentImporter extends Record<keyof ContentImporter, jest.Mock> {
  getLastResult<T>(key: keyof ContentImporter) : T | undefined;
};


export class TestWebContentImporter implements MockWebContentImporter {
  public importContent: jest.Mock<TestPromise<ImportedWebContent>>;

  constructor() {
    this.importContent = jest.fn(() => { return new TestPromise<ImportedWebContent>(); });
  }

  public getLastResult<T>(key: keyof ContentImporter) : T | undefined {
    const { results } = this[key].mock;
    const result = results[results.length - 1]?.value as unknown as T | undefined;

    return result;
  }

  public reset() {
    this.importContent.mockClear();
  }
}