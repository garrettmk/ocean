export type JSONSerializablePrimitive = string | number | null;
export type JSONSerializable = JSONSerializablePrimitive | JSONSerializable[] | { [key: string]: JSONSerializable };

export type ID = string;


export interface Author {
  id: ID,
  name: string
}


export interface AuthorRepository {
  create(input: CreateAuthorInput) : Promise<Author>,
  getById(id: ID) : Promise<Author>,
  listById(ids: ID[]) : Promise<Author[]>
}


export type CreateAuthorInput = {
  name: string
}


export interface DocumentHeader {
  id: ID,
  author: Author,
  isPublic: boolean,
  title: string,
  contentType: string,
}


export interface Document extends DocumentHeader {
  content: JSONSerializable
}


export interface DocumentLink {
  from: ID,
  to: ID,
  meta: {
    [key: string]: JSONSerializable
  }
}

export interface DocumentGraph {
  documents: DocumentHeader[],
  links: DocumentLink[]
}


export interface DocumentRepository {
  create(authorId: ID, input: CreateDocumentInput) : Promise<Document>,
  getById(documentId: ID) : Promise<Document>,
  listByAuthor(authorId: ID) : Promise<DocumentHeader[]>,
  listPublic() : Promise<DocumentHeader[]>,
  listById(ids: ID[]) : Promise<DocumentHeader[]>,
  update(documentId: ID, input: UpdateDocumentInput) : Promise<Document>,
  delete(documentId: ID) : Promise<Document>,
  
  // link(from: ID, to: ID, meta?: DocumentLink['meta']) : Promise<DocumentLink>,
  // getLink(from: ID, to: ID) : Promise<DocumentLink[]>,
  // listLinks(center: ID) : Promise<DocumentLink[]>,
  // updateLink(from: ID, to: ID, meta: DocumentLink['meta']) : Promise<DocumentLink>,
  // unlink(from: ID, to: ID) : Promise<DocumentLink>,
}


type ContentInput = {
  contentType: string,
  content: JSONSerializable
}

type CreateInput = {
  title?: string,
  isPublic?: boolean,
}

type UpdateInput = {
  title?: string,
  isPublic?: boolean
}

export type CreateDocumentInput = CreateInput | (CreateInput & ContentInput);

export type UpdateDocumentInput = UpdateInput | (UpdateInput & ContentInput);