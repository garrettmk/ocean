import axios from 'axios';
import { isSameSubType, parseContentType } from "@/content";
import { AuthorizationError } from "./server-errors";
import { UserRepository } from './server-user-models';
import {
  ContentAnalysisManager,
  ContentMigrationManager,
  ContentMigrationPath,
  Document,
  DocumentGraph,
  DocumentGraphQuery,
  DocumentHeader,
  DocumentLink,
  DocumentLinkRepository,
  DocumentMeta,
  DocumentQuery,
  DocumentRepository,
  ID,
  JSONSerializable,
  NotFoundError,
  validateContentType,
  validateDocumentGraphQuery,
} from "@/domain";
import { htmlContentType, unknownContentType } from '@/content/content-types';
import { HtmlContentLoader, UnknownContentLoader } from '../content-loaders';
import { NotImplementedError } from '@/domain';


export type ServerDocumentInteractorDependencies = {
  documents: DocumentRepository,
  users: UserRepository,
  analysis: ContentAnalysisManager,
  links: DocumentLinkRepository,
  migrations: ContentMigrationManager,
};

export class ServerDocumentInteractor {
  private documents: DocumentRepository;
  private users: UserRepository;
  private analysis: ContentAnalysisManager;
  private links: DocumentLinkRepository;
  private migrations: ContentMigrationManager;


  constructor({ documents, users, analysis, links, migrations }: ServerDocumentInteractorDependencies) {
    this.documents = documents;
    this.users = users;
    this.analysis = analysis; 
    this.links = links;
    this.migrations = migrations;
  }


  async createDocument(userId: ID, input: CreateDocumentInput) : Promise<Document> {
    const user = await this.users.getById(userId);
    const doc = await this.documents.create(user.author.id, input);

    return doc;
  }


  async listDocuments(userId?: ID, query: Omit<DocumentQuery, 'authorId'> = {}) : Promise<DocumentHeader[]> {
    const user = userId && await this.users.getById(userId);
    if (user)
      return await this.documents.query({ ...query, authorId: [user.author.id] });
    else
      return await this.documents.query({ ...query, isPublic: true });
  }


  async updateDocument(userId: ID, documentId: ID, input: UpdateDocumentInput) {
    const user = await this.users.getById(userId);
    const document = await this.documents.getById(documentId);
    const isUpdatePermitted =
      user &&
      document &&
      user.author.id === document.author.id;

    if (!isUpdatePermitted)
      throw new AuthorizationError('Only the document author can make changes');
    
    const newDocument = await this.documents.update(documentId, input);
    return newDocument;
  }


  async getDocument(userId: ID | undefined, documentId: ID) : Promise<Document> {
    const user = userId && await this.users.getById(userId);
    const document = await this.documents.getById(documentId);
    const isViewPermitted = (document.isPublic) || (user && user.author.id === document.author.id);

    if (!isViewPermitted)
      throw new AuthorizationError('Only the document author can view this document');

    return document;
  }

  async getDocumentHeader(userId: ID | undefined, documentId: ID): Promise<DocumentHeader> {
    const user = userId && await this.users.getById(userId);
    const { content, ...header } = await this.documents.getById(documentId);
    const isViewPermitted = (header.isPublic) || (user && user.author.id === header.author.id);

    if (!isViewPermitted)
      throw new AuthorizationError('Only the document author can view this document');

    return header;
  }


  async deleteDocument(userId: ID, documentId: ID) : Promise<Document> {
    const user = await this.users.getById(userId);
    const document = await this.documents.getById(documentId);
    const isDeletePermitted = document.author.id === user.author.id;

    if (!isDeletePermitted)
      throw new AuthorizationError('Only the document author can delete a document');

    await this.documents.delete(document.id);

    const links = await this.links.listLinks(document.id)
    await Promise.all(links.map(link => this.links.unlink(link.from, link.to)));

    return document;
  }


  // async getDocumentGraph(userId: ID, documentId: ID, depth: number = 1) : Promise<DocumentGraph> {
  //   const user = await this.users.getById(userId);
  //   const document = await this.documents.getById(documentId);
  //   const isGetGraphPermitted = 
  //     document.author.id === user.author.id ||
  //     document.isPublic;

  //   if (!isGetGraphPermitted)
  //     throw new AuthorizationError('You don\'t have permission to view this graph');

  //   const recursivelyGetLinks: (id: ID, alreadyVisited?: DocumentLink[], currentDepth?: number) => Promise<DocumentLink[]> = 
  //     async (id: ID, alreadyVisited: DocumentLink[] = [], currentDepth: number = 1) => {
  //       const links = await this.links.listLinks(id);
  //       const linksToVisit = links.filter(link => !alreadyVisited.find(l2 => l2.from === link.from && l2.to === link.to));
  //       const nextAlreadyVisited = [...alreadyVisited, ...linksToVisit];
  //       const linkedIds = linksToVisit.flatMap(link => [link.from, link.to]).filter(id2 => id2 !== id);
  //       const linksFromLinkedIds = currentDepth < depth 
  //         ? (await Promise.all(linkedIds.map(linkedId => recursivelyGetLinks(linkedId, nextAlreadyVisited, currentDepth + 1)))).flat()
  //         : [];

  //       return [...linksToVisit, ...linksFromLinkedIds];
  //     };

  //   const links = await recursivelyGetLinks(documentId);
  //   const documentIds = [documentId, ...links.map(link => link.from), ...links.map(link => link.to)];
  //   const documents = await this.documents.query({ id: documentIds });
    
  //   return { documents, links };
  // }
  

  async getRecommendedLinks(userId: ID, documentId: ID) : Promise<DocumentGraph> {
    const user = await this.users.getById(userId);
    const document = await this.documents.getById(documentId);
    const { content, ...documentHeader } = document;

    const canRead = document.author.id === user.author.id || document.isPublic;
    if (!canRead)
      throw new AuthorizationError(`user ${userId} is not authorized to read document ${documentId}`);
    
    const { links = [] } = await this.analysis.analyze(document.contentType, document.content);
    const linkedIds: ID[] = links
      .map(link => link.url.match(/^\/doc\/(.+)/))
      .filter(matches => matches?.[1])
      .map(matches => matches![1]);

    const linkedDocuments = await this.documents.query({ id: linkedIds });

    const graph: DocumentGraph = {
      documents: [documentHeader, ...linkedDocuments],
      links: linkedDocuments.map(({ id }) => ({
        from: document.id,
        to: id,
        meta: {}
      }))
    };

    return graph;
  }


  async linkDocuments(userId: ID, fromId: ID, toId: ID, meta?: Record<string, JSONSerializable>) : Promise<DocumentLink> {
    const user = await this.users.getById(userId);
    const fromDoc = await this.documents.getById(fromId);
    const toDoc = await this.documents.getById(toId);

    const canLink = 
      fromDoc.author.id === user.author.id &&
      (toDoc.author.id === user.author.id || toDoc.isPublic);
    if (!canLink)
      throw new AuthorizationError(`User does not have permission to link these documents`);

    const link = await this.links.link(fromId, toId, meta);

    return link;
  }


  async unlinkDocuments(userId: ID, fromId: ID, toId: ID) : Promise<DocumentLink> {
    const user = await this.users.getById(userId);
    const fromDoc = await this.documents.getById(fromId);
    const toDoc = await this.documents.getById(toId);

    const canUnlink = 
      fromDoc.author.id === user.author.id &&
      (toDoc.author.id === user.author.id || toDoc.isPublic);
    if (!canUnlink)
      throw new AuthorizationError(`User does not have permission to unlink these documents`);

    const link = await this.links.unlink(fromId, toId);

    return link;
  }


  async importDocumentFromUrl(userId: ID, url: string) : Promise<Document> {
    // Fetch the resource, read the content and contentType
    const response = await axios.get(url);
    const contentType = response.headers['content-type'] ?? unknownContentType.value;
    const content = response.data;
    
    // Is it HTML?
    if (HtmlContentLoader.supportsContentType(contentType)) {
      const user = await this.users.getById(userId);
      const loader = new HtmlContentLoader(content, url);

      await loader.resolveRelativeLinks(url);

      const document = await this.documents.create(user.author.id, {
        title: await loader.getTitle(),
        contentType: 'text/html',
        content: await loader.toContent(),
      });

      return document;
    }

    // Is it an unknown MIME type?
    if (UnknownContentLoader.supportsContentType(contentType)) {
      const user = await this.users.getById(userId);
      const loader = new UnknownContentLoader(response.data);

      const document = await this.documents.create(user.author.id, {
        title: url,
        contentType: contentType,
        content: loader.toContent(),
      });

      return document;
    }

    // Holy shit, it's not even UNKNOWN??
    throw new NotImplementedError(`No loader for content type ${contentType}`);
  }


  async graphByQuery(userId: ID, query: DocumentGraphQuery) : Promise<DocumentGraph> {
    validateDocumentGraphQuery(query);

    const { radius, ...documentQuery } = query;
    const user = await this.users.getById(userId);

    // Get the documents returned by the query, and all of their links
    let documents = await this.documents.query({ ...documentQuery, authorId: [user.author.id] });
    let links = (await Promise.all(documents.map(doc => this.links.listLinks(doc.id)))).flat();

    // Filter out duplicate links
    links = Object.values(links.reduce((result, current) => {
      const key = `${current.from}-${current.to}`;
      result[key] = current;
      return result;
    }, {} as Record<string, DocumentLink>));

    // Get any documents we didn't already grab
    const documentIds = documents.map(({ id }) => id);
    const linkedDocumentIds = links.flatMap(link => [link.from, link.to]);
    const additionalDocumentIds = Array.from(new Set(linkedDocumentIds.filter(id => !documentIds.includes(id))));
    const additionalDocuments = await this.documents.query({ id: additionalDocumentIds, authorId: [user.author.id] });

    // Put it all together and return it as a graph
    return {
      documents: [...documents, ...additionalDocuments],
      links: links
    };
  }


  async listContentConversions(contentType: string) : Promise<string[]> {
    validateContentType(contentType);
    const parsedContentType = parseContentType(contentType);
    const migrationPaths = await this.migrations.getMigrationPaths(parsedContentType);

    return migrationPaths.map(path => path.to.value);
  }


  async convertContent(content: any, from: string, to: string) {
    const fromType = parseContentType(from);
    const toType = parseContentType(to);

    const migration = (await this.migrations.getMigrationPaths(fromType, toType))[0];
    if (!migration)
      throw new NotFoundError(`Migration from ${from} to ${to}`);

    const newContent = await this.migrations.migrate(content, migration);

    return newContent;
  }
}


type CreateTitleInput = {
  title?: string,
  isPublic?: boolean,
  meta?: DocumentMeta
}

type CreateContentInput = {
  contentType: string,
  content: any
}

export type CreateDocumentInput = CreateTitleInput | CreateContentInput | (CreateTitleInput & CreateContentInput);
export type UpdateDocumentInput = CreateTitleInput | CreateContentInput | (CreateTitleInput & CreateContentInput);
