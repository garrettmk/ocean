import { ID, JSONSerializable, MetaObject } from "../common";
import { Author } from '../authors';


export type NodeLayoutData = {
  x: number,
  y: number,
  width: number,
  height: number,
}

export type DocumentMeta = {
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  isOpen?: boolean,
  [key: string]: JSONSerializable | undefined
};

export interface DocumentHeader {
  id: ID,
  author: Author,
  isPublic: boolean,
  title: string,
  contentType: string,
  meta: DocumentMeta
}


export interface Document extends DocumentHeader {
  content: JSONSerializable
}


export interface DocumentRepository {
  create(authorId: ID, input: CreateDocumentInput) : Promise<Document>,
  getById(documentId: ID) : Promise<Document>,
  query(query: DocumentQuery) : Promise<DocumentHeader[]>,
  update(documentId: ID, input: UpdateDocumentInput) : Promise<Document>,
  delete(documentId: ID) : Promise<Document>,
}


type ContentInput = {
  contentType: string,
  content: JSONSerializable
}

type CreateInput = {
  title?: string,
  isPublic?: boolean,
  meta?: DocumentMeta,
}

type UpdateInput = {
  title?: string,
  isPublic?: boolean,
  meta?: DocumentMeta,
}

export type CreateDocumentInput = CreateInput | (CreateInput & ContentInput);

export type UpdateDocumentInput = UpdateInput | (UpdateInput & ContentInput);

export type DocumentQuery = {
  id?: ID[],
  authorId?: ID[],
  isPublic?: boolean,
  title?: string[],
  contentType?: string[]
}


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


export type DocumentGraphQuery = DocumentQuery & {
  radius?: number
}
