
export type ID = string;


export interface Author {
  id: ID,
  name: string
}


export interface AuthorRepository {
  create(input: CreateAuthorInput) : Promise<Author>,
  getById(id: ID) : Promise<Author>,
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
  content: any
}


export interface DocumentRepository {
  create(input: CreateDocumentInput) : Promise<Document>,
  getById(documentId: ID) : Promise<Document>,
  listByAuthor(authorId: ID) : Promise<DocumentHeader[]>,
  listPublic() : Promise<DocumentHeader[]>,
  update(documentId: ID, input: UpdateDocumentInput) : Promise<Document>,
  delete(documentId: ID) : Promise<boolean>
}


type ContentInput = {
  contentType: string,
  content: any
}

type CreateInput = {
  authorId: ID,
  title?: string,
  isPublic?: boolean,
}

type UpdateInput = {
  title?: string,
  isPublic?: boolean
}

export type CreateDocumentInput = CreateInput | (CreateInput & ContentInput);

export type UpdateDocumentInput = UpdateInput | (UpdateInput & ContentInput)

