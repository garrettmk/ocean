import { Document, DocumentHeader } from '@/domain';
import { ClientDocumentsGateway } from "@/client/interfaces";
import { TestPromise } from "./TestPromise";

type Mock = ReturnType<typeof jest.fn>;
interface MockClientDocumentsGateway extends Record<keyof ClientDocumentsGateway, Mock> {}

export class TestClientGateway implements MockClientDocumentsGateway {
  public getDocument: Mock;
  public createDocument: Mock;
  public updateDocument: Mock;
  public deleteDocument: Mock;
  public listDocuments: Mock;

  constructor() {
    this.getDocument = jest.fn(() => { return new TestPromise<Document>(); });
    this.createDocument = jest.fn(() => { return new TestPromise<Document>(); });
    this.updateDocument = jest.fn(() => { return new TestPromise<Document>(); });
    this.deleteDocument = jest.fn(() => { return new TestPromise<Document>(); });
    this.listDocuments = jest.fn(() => { return new TestPromise<DocumentHeader[]>(); });
  }

  public getLastResult<T>(key: keyof MockClientDocumentsGateway) : T | undefined {
    const { results } = this[key].mock;
    const result = results[results.length - 1]?.value as unknown as T | undefined;

    return result;
  }

  public reset() {
    this.getDocument.mockClear();
    this.createDocument.mockClear();
    this.updateDocument.mockClear();
    this.deleteDocument.mockClear();
    this.listDocuments.mockClear();
  }
}