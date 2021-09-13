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


export interface DocumentRepository {
  create(authorId: ID, input: CreateDocumentInput) : Promise<Document>,
  getById(documentId: ID) : Promise<Document>,
  listByAuthor(authorId: ID) : Promise<DocumentHeader[]>,
  listPublic() : Promise<DocumentHeader[]>,
  listById(ids: ID[]) : Promise<DocumentHeader[]>,
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
}

type UpdateInput = {
  title?: string,
  isPublic?: boolean
}

export type CreateDocumentInput = CreateInput | (CreateInput & ContentInput);

export type UpdateDocumentInput = UpdateInput | (UpdateInput & ContentInput);


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


// The parsed contentType
export type ContentType = {
  name: string,
  value: string,
  type: string,
  subType: string,
  parameter?: string,
  parameterValue?: string,
}


// A migration between content types
export interface ContentTypeMigration {
  name: string,
  from: ContentType,
  to: ContentType,

  migrate(content: any) : Promise<any>,
}

// Describes a list of migrations from one content type to another
export type ContentTypeMigrationPath = {
  from: ContentType,
  to: ContentType,
  migrations: ContentTypeMigration[]
}


// Manages migrations
export interface ContentMigrationManager {
  registerMigration(migration: ContentTypeMigration, replace?: boolean) : Promise<boolean>,
  listAllMigrations() : Promise<ContentTypeMigration[]>,
  listNextMigrations(from: ContentType) : Promise<ContentTypeMigration[]>,
  getMigrationPaths(from: ContentType, to?: ContentType) : Promise<ContentTypeMigrationPath[]>,
  migrate(content: any, path: ContentTypeMigrationPath, direction?: 'up' | 'down') : Promise<any> 
}

// Content analysis
export type ContentAnalysis = {
  subject?: string[],
  links?: OutboundLink[]
}

export type OutboundLink = {
  url: string
}

export interface ContentAnalyzer {
  contentTypes: string[],
  analyze(contentType: string, content: any) : Promise<ContentAnalysis>
}


export interface ContentAnalysisManager {
  registerAnalyzer(analyzer: ContentAnalyzer, replace?: boolean) : Promise<boolean>,
  listAllAnalyzers() : Promise<ContentAnalyzer[]>,
  getAnalyzer(contentType: string) : Promise<ContentAnalyzer>,
  analyze(contentType: string, content: any) : Promise<ContentAnalysis>
}