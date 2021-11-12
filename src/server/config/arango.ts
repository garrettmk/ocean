import { assert, object, string, refine, optional } from 'superstruct';
const nonempty = () => refine(string(), 'nonempty', value => !!value.length);


export type ArangoConnectionConfig = {
  url: string,
  database: string,
  username?: string,
  password?: string,
  token?: string
};

export const arangoConnectionConfig: ArangoConnectionConfig = {
  url: process.env.ARANGO_URL!,
  database: process.env.ARANGO_DB!,
  username: process.env.ARANGO_USERNAME,
  password: process.env.ARANGO_PASSWORD,
  token: process.env.ARANGO_TOKEN,
};

assert(arangoConnectionConfig, object({
  url: nonempty(),
  database: nonempty(),
  username: optional(string()),
  password: optional(string()),
  token: optional(string())
}));


export type ArangoCollectionNames = {
  authors: string,
  users: string,
  documents: string,
  documentLinks: string
};

export const arangoCollectionNames: ArangoCollectionNames = {
  authors: process.env.ARANGO_COLLECTION_AUTHORS ?? 'authors',
  users: process.env.ARANGO_COLLECTION_USERS ?? 'users',
  documents: process.env.ARANGO_COLLECTION_DOCUMENTS ?? 'documents',
  documentLinks: process.env.ARANGO_COLLECTION_DOCUMENT_LINKS ?? 'documentLinks'
};

assert(arangoCollectionNames, object({
  authors: nonempty(),
  users: nonempty(),
  documents: nonempty(),
  documentLinks: nonempty()
}));