import { ID } from "@/domain";
import { CreateDocumentInput, ClientDocumentsGateway, AuthorizationError } from "@/server";
import { CombinedError } from "@urql/core";
import { DocumentNode, GraphQLError } from "graphql";
import gql from "graphql-tag";
import { NotFoundError, NotImplementedError, OceanError, ValidationError } from '@/domain';
import e from "cors";


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
}



function fromCombinedError(error: GraphQLCombinedError) : Error {
  const originalError = error?.graphQLErrors?.[0]?.originalError;
  if (!originalError) return error;

  // @ts-ignore
  const { name, ...extensions } = originalError.extensions;

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