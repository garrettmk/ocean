import { AuthorizationError, ClientDocumentsGateway } from "@/client/interfaces";
import { CreateDocumentInput, DocumentGraphQuery, DocumentLinkMeta, DocumentQuery, ID, NotFoundError, NotImplementedError, UpdateDocumentInput, validateCreateDocumentInput, validateUpdateDocumentInput, ValidationError } from "@/domain";
import { DocumentNode, GraphQLError } from "graphql";
import gql from "graphql-tag";


export interface GraphQLClient {
  query(q: DocumentNode, variables?: Record<string, any>): Promise<GraphQLResult>,
  mutation(m: DocumentNode, variables?: Record<string, any>): Promise<GraphQLResult>
}

export type GraphQLResult = {
  data?: any,
  error?: GraphQLCombinedError
}


export interface GraphQLCombinedError extends Error {
  networkError?: Error,
  graphQLErrors?: GraphQLError[]
}


export class DocumentsGraphQLClient implements ClientDocumentsGateway {
  private client: GraphQLClient;


  constructor(client: GraphQLClient) {
    this.client = client;
  }

  
  async listDocuments(query: Omit<DocumentQuery, 'authorId'> = {}) {
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
        }
      }
    `;

    const result = await this.client.query(_query, { query });
    if (result.error)
      throw fromCombinedError(result.error);

    return result.data?.listDocuments ?? [];
  }

  async getDocument(id: ID) {
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
        }
      }
    `;

    const result = await this.client.query(query, { id });
    if (result.error)
      throw fromCombinedError(result.error);

    return result.data?.getDocument;
  }


  async createDocument(input: CreateDocumentInput) {
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
        }
      }
    `;

    const result = await this.client.mutation(query, { input });
    if (result.error)
      throw fromCombinedError(result.error);

    return result?.data?.createDocument;
  }


  async updateDocument(id: ID, input: UpdateDocumentInput) {
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
        }
      }
    `;

    const result = await this.client.mutation(query, { id, input });
    if (result.error)
      throw fromCombinedError(result.error);
    
    return result?.data?.updateDocument;
  }


  async deleteDocument(id: ID) {
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
        }
      }
    `;

    const result = await this.client.mutation(query, { id });
    if (result.error)
      throw fromCombinedError(result.error);

    return result?.data?.deleteDocument;
  }


  async getRecommendedLinks(id: ID) {
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
          }
          links {
            from
            to
            meta
          }
        }
      }
    `;

    const result = await this.client.query(query, { id });
    if (result.error)
      throw fromCombinedError(result.error);

    return result!.data!.getRecommendedLinks
  }


  async linkDocuments(fromId: ID, toId: ID, meta: DocumentLinkMeta = {}) {
    const query = gql`
      mutation($fromId: ID!, $toId: ID!, $meta: JSON) {
        linkDocuments(fromId: $fromId, toId: $toId, meta: $meta) {
          from
          to
          meta
        }
      }
    `;

    const result = await this.client.mutation(query, { fromId, toId, meta });
    if (result.error)
      throw fromCombinedError(result.error);

    return result.data!.linkDocuments
  }


  async unlinkDocuments(fromId: ID, toId: ID) {
    const query = gql`
      mutation($fromId: ID!, $toId: ID!) {
        unlinkDocuments(fromId: $fromId, toId: $toId) {
          from
          to
          meta
        }
      }
    `;

    const result = await this.client.mutation(query, { fromId, toId });
    if (result.error)
      throw fromCombinedError(result.error);

    return result.data!.unlinkDocuments
  }


  async getDocumentGraph(id: ID, depth?: number) {
    const query = gql`
      query($id: ID!, $depth: Int) {
        getDocumentGraph(id: $id, depth: $depth) {
          documents {
            id
            author {
              id
              name
            }
            isPublic
            title
            contentType
          }
          links {
            from
            to
            meta
          }
        }
      }
    `;

    const result = await this.client.query(query, { id, depth });
    if (result.error)
      throw fromCombinedError(result.error);

    return result.data!.getDocumentGraph;
  }

  async importDocumentFromUrl(url: string) {
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
        }
      }
    `;

    const result = await this.client.mutation(query, { url });
    if (result.error)
     throw fromCombinedError(result.error);

    return result.data!.importDocumentFromUrl;
  }


  async graphByQuery(query: DocumentGraphQuery = {}) {
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
          }
          links {
            from
            to
            meta
          }
        }
      }
    `;

    const result = await this.client.query(_query, { query });
    if (result.error)
      throw fromCombinedError(result.error);

    return result.data!.graphByQuery;
  }
}



function fromCombinedError(error: GraphQLCombinedError) : Error {
  const originalError = error?.graphQLErrors?.[0]?.originalError;
  if (!originalError) return error;

  // @ts-ignore
  const { name, ...extensions } = originalError?.extensions ?? {};

  if (name === NotImplementedError.name)
    return new NotImplementedError(originalError.message);
  else if (name === NotFoundError.name)
    return new NotFoundError(originalError.message);
  else if (name === ValidationError.name)
    return new ValidationError(
      originalError.message,
      // @ts-ignore
      extensions.path,
      // @ts-ignore 
      extensions.expected,
      // @ts-ignore 
      extensions.received
    );
  else if (name === AuthorizationError.name)
    return new AuthorizationError(originalError.message);

  return error;
}