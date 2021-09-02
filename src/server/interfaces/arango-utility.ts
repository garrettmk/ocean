import { Database, aql } from "arangojs";
import { AqlQuery } from "arangojs/aql";


export class ArangoUtility {
  protected db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async initialize() {}

  protected async firstOrUndefined<T extends any = any>(query: AqlQuery) : Promise<T | undefined> {
    return this.db.query(query)
      .then(cursor => cursor.all())
      .then((values: T[]) => values[0]);
  }
}