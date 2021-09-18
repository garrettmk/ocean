import { Database } from "arangojs";


export class TestArangoDb {
  public readonly db: Database;
  public readonly url: string = 'http://localhost:8529';
  public readonly databaseName: string = 'test';

  constructor() {
    this.db = new Database({
      url: this.url,
      databaseName: this.databaseName
    });
  }


  async emptyCollectionIfExists(name: string) {
    const collection = this.db.collection(name);
    const collectionExists = await collection.exists();
    if (collectionExists) {
      await collection.truncate();
    }
  }
}