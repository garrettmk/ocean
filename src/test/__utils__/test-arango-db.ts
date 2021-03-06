import { Database } from "arangojs";


export class TestArangoDb {
  public readonly url: string = 'http://localhost:8529';
  public db?: Database;

  private sys: Database;
  private dbName: string;


  constructor() {
    this.dbName = `test-${new Date().getTime()}`;
    this.sys = new Database({ url: this.url });
  }

  async initialize() {
    this.db = await this.sys.createDatabase(this.dbName);
  }

  async drop() {
    return new Promise<void>(resolve => { 
      this.sys.dropDatabase(this.dbName);
      setTimeout(() => resolve(), 50);
    });
  }

  async close() {
    return new Promise<void>(resolve => { 
      this.sys.close();
      this.db?.close();
      
      setTimeout(() => resolve(), 50);
    });
  }
}