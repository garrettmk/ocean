import { ID, validateCreateDocumentInput, validateUpdateDocumentInput, CreateDocumentInput, DocumentLinkMeta } from "@/domain";
import { ClientDocumentsGateway, AuthorizationError } from "@/client/interfaces";
import { CombinedError } from "@urql/core";
import { DocumentNode, GraphQLError } from "graphql";
import gql from "graphql-tag";
import { NotFoundError, NotImplementedError, OceanError, ValidationError } from '@/domain';
import e from "cors";
import { UpdateDocumentInput } from "@/server/usecases";


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

  
  async listDocuments() {
    const query = gql`
      query {
        listDocuments {
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

    const result = await this.client.query(query);
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

    return result.data!.linkDocuments
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