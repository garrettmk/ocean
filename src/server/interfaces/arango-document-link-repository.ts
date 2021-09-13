import { DocumentLink, DocumentLinkMeta, DocumentLinkRepository, ID, validateDocumentLink } from "@/domain";
import { aql, Database } from "arangojs";
import { CollectionType, EdgeCollection } from "arangojs/collection";
import { Document as ArangoDocument } from 'arangojs/documents';
import { ArangoDocumentRepository } from "./arango-document-repository";


type DbDocumentLink = {
  meta: DocumentLinkMeta
}


export type ArangoDocumentLinkRepoConfig = {
  db: Database,
  collectionNames: {
    documentLinks: string
  }
}


export class ArangoDocumentLinkRepository implements DocumentLinkRepository {
  private db: Database;
  private documents: ArangoDocumentRepository;

  public collection: EdgeCollection<DbDocumentLink>;


  constructor(documents: ArangoDocumentRepository, config: ArangoDocumentLinkRepoConfig) {
    const { db, collectionNames } = config;

    this.db = db;
    this.documents = documents;
    this.collection = db.collection(collectionNames.documentLinks);
  }


  async initialize() {
    const collectionExists = await this.collection.exists();
    if (!collectionExists)
      await this.collection.create({
        type: CollectionType.EDGE_COLLECTION
      });
  }


  async link(from: ID, to: ID, meta: DocumentLinkMeta = {}) {
    const fromId = this.documents.getDatabaseId(from);
    const toId = this.documents.getDatabaseId(to);

    const link = await this.db.query(aql`
      INSERT {
        _from: ${fromId},
        _to: ${toId},
        meta: ${meta},
      } INTO ${this.collection}
      RETURN NEW
    `)
    .then(cursor => cursor.all())
    .then(values => values[0])
    .then(doc => this.fromDocument(doc));

    validateDocumentLink(link);

    return link;
  }


  async unlink(from: ID, to: ID) {
    const fromId = this.documents.getDatabaseId(from);
    const toId = this.documents.getDatabaseId(to);

    const link = await this.db.query(aql`
      FOR link IN ${this.collection}
        FILTER link._from == ${fromId}
        FILTER link._to == ${toId}
        REMOVE link IN ${this.collection}
        RETURN OLD
    `)
    .then(cursor => cursor.all())
    .then(values => values[0])
    .then(doc => this.fromDocument(doc));

    validateDocumentLink(link);

    return link;
  }


  async getLink(from: ID, to: ID) {
    const fromId = this.documents.getDatabaseId(from);
    const toId = this.documents.getDatabaseId(to);

    const link = await this.db.query(aql`
      FOR link IN ${this.collection}
        FILTER link._from == ${fromId}
        FILTER link._to == ${toId}
        RETURN link
    `)
    .then(cursor => cursor.all())
    .then(values => values[0])
    .then(doc => this.fromDocument(doc));

    validateDocumentLink(link);

    return link;
  }


  async listLinks(from: ID) {
    const fromId = this.documents.getDatabaseId(from);

    const links = await this.db.query(aql`
      FOR link IN ${this.collection}
        FILTER link._from == ${fromId}
        RETURN link
    `)
    .then(cursor => cursor.all())
    .then(docs => docs.map(doc => {
      const link = this.fromDocument(doc);
      validateDocumentLink(link);
      return link;
    }));

    return links;
  }


  async updateLink(from: ID, to: ID, meta: DocumentLinkMeta) {
    const fromId = this.documents.getDatabaseId(from);
    const toId = this.documents.getDatabaseId(to);

    const link = await this.db.query(aql`
      FOR link IN ${this.collection}
        FILTER link._from == ${fromId}
        FILTER link._to == ${toId}
        UPDATE link WITH {
          meta: ${meta}
        }
        RETURN NEW
    `)
    .then(cursor => cursor.all())
    .then(values => values[0])
    .then(doc => this.fromDocument(doc));

    validateDocumentLink(link);

    return link;
  }

  private fromDocument(doc: ArangoDocument<DbDocumentLink>) : DocumentLink {
    const { _id, _key, _rev, _from, _to, ...documentLinkFields } = doc;
    return {
      from: _from!.split('/')[1],
      to: _to!.split('/')[1],
      ...documentLinkFields
    };
  }
}