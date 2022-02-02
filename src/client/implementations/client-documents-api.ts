import { ClientDocumentsGateway, GraphQLClient, GraphQLResult } from "@/client/interfaces";
import { fromCombinedError, Source, map, pipe } from "@/client/utils";
import {
  CreateDocumentInput,
  Document,
  DocumentGraph,
  DocumentGraphQuery,
  DocumentHeader,
  DocumentLink,
  DocumentLinkMeta,
  DocumentQuery,
  ID,
  JSONSerializable,
  UpdateDocumentInput,
  validateContentType,
  validateCreateDocumentInput,
  validateDocumentGraphQuery,
  validateDocumentLinkMeta,
  validateUpdateDocumentInput
} from "@/domain";
import gql from "graphql-tag";


export class DocumentsGraphQLClient implements ClientDocumentsGateway {
  private client: GraphQLClient;


  constructor(client: GraphQLClient) {
    this.client = client;
  }
  

  private wrapResult<T>(source: Source<GraphQLResult>, key: string) : Source<T> {
    return pipe(
      source,
      map(result => {
        if (result.error)
          throw fromCombinedError(result.error);

        return result.data![key];
      })
    );
  }

  
  listDocuments(query: Omit<DocumentQuery, 'authorId'> = {}) : Source<DocumentHeader[]> {
    const _query = gql`
      query($query: DocumentQuery) {
        listDocuments(query: $query) {
          id
          title
          author {
            id
            name
          }
          isPublic
          contentType
          meta
        }
      }
    `;

    return this.wrapResult(
      this.client.query(_query, { query }), 
      'listDocuments'
    );
  }


  getDocument(id: ID) : Source<Document> {
    const query = gql`
      query($id: ID!) {
        getDocument(id: $id) {
          id
          title
          author {
            id
            name
          }
          isPublic
          contentType
          content
          meta
        }
      }
    `;

    return this.wrapResult(
      this.client.query(query, { id }),
      'getDocument'
    );
  }


  getDocumentHeader(id: ID): Source<DocumentHeader> {
    const query = gql`
      query($id: ID!) {
        getDocumentHeader(id: $id) {
          id
          title
          author {
            id
            name
          }
          isPublic
          contentType
          meta
        }
      }
    `;

    return this.wrapResult(
      this.client.query(query, { id }),
      'getDocumentHeader'
    );
  }


  createDocument(input: CreateDocumentInput) : Source<Document>{
    validateCreateDocumentInput(input);

    const query = gql`
      mutation($input: CreateDocumentInput!) {
        createDocument(input: $input) {
          id
          title
          author {
            id
            name
          }
          isPublic
          contentType
          content
          meta
        }
      }
    `;

    return this.wrapResult(
      this.client.mutation(query, { input }),
      'createDocument'
    );
  }


  updateDocument(id: ID, input: UpdateDocumentInput) : Source<Document>{
    validateUpdateDocumentInput(input);

    const query = gql`
      mutation($id: ID!, $input: UpdateDocumentInput!) {
        updateDocument(id: $id, input: $input) {
          id
          title
          author {
            id
            name
          }
          isPublic
          contentType
          content
          meta
        }
      }
    `;

    return this.wrapResult(
      this.client.mutation(query, { id, input }),
      'updateDocument'
    );
  }


  deleteDocument(id: ID) : Source<Document>{
    const query = gql`
      mutation($id: ID!) {
        deleteDocument(id: $id) {
          id
          title
          author {
            id
            name
          }
          isPublic
          contentType
          content
          meta
        }
      }
    `;

    return this.wrapResult(
      this.client.mutation(query, { id }),
      'deleteDocument'
    );
  }


  getRecommendedLinks(id: ID) : Source<DocumentGraph> {
    const query = gql`
      query($id: ID!) {
        getRecommendedLinks(id: $id) {
          documents {
            id
            author {
              id
              name
            }
            isPublic
            title
            contentType
            meta
          }
          links {
            from
            to
            meta
          }
        }
      }
    `;

    return this.wrapResult(
      this.client.query(query, { id }),
      'getRecommendedLinks'
    );
  }


  linkDocuments(fromId: ID, toId: ID, meta: DocumentLinkMeta = {}) : Source<DocumentLink> {
    validateDocumentLinkMeta(meta);

    const query = gql`
      mutation($fromId: ID!, $toId: ID!, $meta: JSON) {
        linkDocuments(fromId: $fromId, toId: $toId, meta: $meta) {
          from
          to
          meta
        }
      }
    `;

    return this.wrapResult(
      this.client.mutation(query, { fromId, toId, meta }),
      'linkDocuments'
    );
  }


  unlinkDocuments(fromId: ID, toId: ID) : Source<DocumentLink> {
    const query = gql`
      mutation($fromId: ID!, $toId: ID!) {
        unlinkDocuments(fromId: $fromId, toId: $toId) {
          from
          to
          meta
        }
      }
    `;

    return this.wrapResult(
      this.client.mutation(query, { fromId, toId }),
      'unlinkDocuments'
    );
  }
  

  importDocumentFromUrl(url: string) : Source<Document> {
    const query = gql`
      mutation($url: String!) {
        importDocumentFromUrl(url: $url) {
          id
          title
          author {
            id
            name
          }
          isPublic
          contentType
          content
          meta
        }
      }
    `;

    return this.wrapResult(
      this.client.mutation(query, { url }),
      'importDocumentFromUrl'
    );
  }


  graphByQuery(query: DocumentGraphQuery = {}) : Source<DocumentGraph> {
    validateDocumentGraphQuery(query);

    const _query = gql`
      query($query: DocumentGraphQuery) {
        graphByQuery(query: $query) {
          documents {
            id
            author {
              id
              name
            }
            isPublic
            title
            contentType
            meta
          }
          links {
            from
            to
            meta
          }
        }
      }
    `;

    return this.wrapResult(
      this.client.query(_query, { query }),
      'graphByQuery'
    );
  }


  listContentConversions(from: string) : Source<string[]> {
    validateContentType(from);
    
    const query = gql`
      query($from: String!) {
        listContentConversions(from: $from)
      }
    `;

    return this.wrapResult(
      this.client.query(query, { from }),
      'listContentConversions'
    );
  }


  convertContent(content: JSONSerializable, from: string, to: string) : Source<any> {
    const query = gql`
      mutation($content: JSON!, $from: String!, $to: String!) {
        convertContent(content: $content, from: $from, to: $to)
      }
    `;

    return this.wrapResult(
      this.client.mutation(query, { content, from ,to }),
      'convertContent'
    );
  }


  watchDocument(id: ID) {
    const subscription = gql`
      subscription($id: ID!) {
        watchDocument(id: $id) {
          id
          author {
            id
            name
          }
          isPublic
          title
          contentType
          content
          meta
        }
      }
    `;

    return pipe(
      this.client.subscription(subscription, { id }),
      map(result => {
        if (result.error)
          throw fromCombinedError(result.error)
        
        return result.data!.watchDocument as Document;
      }),
    );
  }
}

