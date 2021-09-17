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
    const collection = await this.db.collection(name);
    if (await collection.exists()) {
      await collection.truncate();
    }
  }
}