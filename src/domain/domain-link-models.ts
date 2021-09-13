import { ID, JSONSerializable } from "./domain-common-types";
import { DocumentHeader } from "./domain-document-models";


export interface DocumentLinkRepository {
  link(from: ID, to: ID, meta?: DocumentLinkMeta) : Promise<DocumentLink>,
  getLink(from: ID, to: ID) : Promise<DocumentLink>,
  listLinks(center: ID) : Promise<DocumentLink[]>,
  updateLink(from: ID, to: ID, meta: DocumentLinkMeta) : Promise<DocumentLink>,
  unlink(from: ID, to: ID) : Promise<DocumentLink>,  
}


export type DocumentLinkMeta = Record<string, JSONSerializable>;

export interface DocumentLink {
  from: ID,
  to: ID,
  meta: DocumentLinkMeta
}

export interface DocumentGraph {
  documents: DocumentHeader[],
  links: DocumentLink[]
}