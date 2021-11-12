import type { ArangoConnectionConfig } from "../config";
import { Database } from 'arangojs';


export async function makeArangoConnection(config: ArangoConnectionConfig) {
  const { url, database, username, password, token } = config;

  let db = new Database({
    url,
    auth: token ? { token } :
          username ? { username, password } :
          undefined
  });

  const existingDatabases = await db.listDatabases();
  if (existingDatabases.includes(database))
    db = db.database(database);
  else
    db = await db.createDatabase(database);

  return db;
}