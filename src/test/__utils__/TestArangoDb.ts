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
    return this.sys.dropDatabase(this.dbName);
  }
}